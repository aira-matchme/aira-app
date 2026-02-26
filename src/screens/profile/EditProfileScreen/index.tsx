import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { AddPhotoIcon } from '../../../assets/icons/common/AddPhotoIcon';
import { CloseIcon } from '../../../assets/icons/common/CloseIcon';
import { ActionSheetCameraIcon } from '../../../assets/icons/common/ActionSheetCameraIcon';
import { ActionSheetGalleryIcon } from '../../../assets/icons/common/ActionSheetGalleryIcon';
import { ProfileChevronRightIcon } from '../../../assets/icons/profile/ProfileMenuIcons';
import { Button } from '../../../components/Button';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import {
  checkCameraPermission,
  requestCameraPermission,
  checkPhotoLibraryPermission,
  requestPhotoLibraryPermission,
} from '../../../config/permissions';
import { STRINGS } from '../../../constants/strings';
import { colors, typography } from '../../../theme';
import type { ProfileStackParamList } from '../../../navigation/types';
import { uploadProfilePhotoApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { styles } from './styles';

const PHOTO_SLOTS = 6;
const PROFILE_PERCENT = 75;

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

const DETAIL_ROWS: Array<{ key: string; label: string; value: string }> = [
  { key: 'name', label: 'Name', value: 'David Taylor' },
  { key: 'gender', label: 'Gender', value: 'Male' },
  { key: 'height', label: 'Height', value: '175cm' },
  { key: 'education', label: 'Education', value: 'PhD/ Dr' },
  { key: 'employment', label: 'Employment', value: 'Self Employed' },
  { key: 'income', label: 'Income', value: '£20k-30k' },
  { key: 'marital', label: 'Marital Status', value: 'Never Married' },
  { key: 'children', label: 'Children', value: 'No' },
  { key: 'interests', label: 'Interests', value: 'Music, Gaming, Art & Craft, Travel, Sports' },
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(PHOTO_SLOTS).fill(null));
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [pendingCameraIndex, setPendingCameraIndex] = useState<number | null>(null);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [pendingGalleryIndex, setPendingGalleryIndex] = useState<number | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const handlePickerResponse = async (
    response: {
      didCancel?: boolean;
      errorCode?: string;
      errorMessage?: string;
      assets?: Array<{ uri?: string }>;
    },
    index: number
  ) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage ?? 'Failed to pick image');
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (!uri) return;

    setPhotos((prev) => {
      const next = [...prev];
      next[index] = uri;
      return next;
    });

    const order = index + 1;
    setUploadingSlot(index);
    try {
      await uploadProfilePhotoApi(uri, order);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Failed to upload photo. Please try again.';
      Alert.alert('Upload Failed', message);
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  const openActionSheet = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    setShowActionSheet(false);
    setSelectedPhotoIndex(null);
  };

  const openCameraForSlot = (index: number) => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) =>
      handlePickerResponse(response, index)
    );
  };

  const handleCamera = async () => {
    if (selectedPhotoIndex === null) return;
    const index = selectedPhotoIndex;
    closeActionSheet();
    const status = await checkCameraPermission();
    if (status === 'granted') {
      openCameraForSlot(index);
      return;
    }
    setPendingCameraIndex(index);
    setShowCameraPermissionSheet(true);
  };

  const handleAllowCameraPermission = async () => {
    if (pendingCameraIndex === null) return;
    const index = pendingCameraIndex;
    setIsRequestingPermission(true);
    try {
      const status = await requestCameraPermission();
      setShowCameraPermissionSheet(false);
      setPendingCameraIndex(null);
      if (status === 'granted') openCameraForSlot(index);
      else
        Alert.alert('Camera Permission Required', 'Please enable camera access in Settings.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()) },
        ]);
    } catch {
      setShowCameraPermissionSheet(false);
      setPendingCameraIndex(null);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const openGalleryForSlot = (index: number) => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) =>
      handlePickerResponse(response, index)
    );
  };

  const handleGallery = async () => {
    if (selectedPhotoIndex === null) return;
    const index = selectedPhotoIndex;
    closeActionSheet();
    const status = await checkPhotoLibraryPermission();
    const hasAccess = status === 'granted' || status === 'limited';
    if (hasAccess) {
      openGalleryForSlot(index);
      return;
    }
    setPendingGalleryIndex(index);
    setShowGalleryPermissionSheet(true);
  };

  const handleAllowGalleryPermission = async () => {
    if (pendingGalleryIndex === null) return;
    const index = pendingGalleryIndex;
    setIsRequestingPermission(true);
    try {
      const status = await requestPhotoLibraryPermission();
      setShowGalleryPermissionSheet(false);
      setPendingGalleryIndex(null);
      const hasAccess = status === 'granted' || status === 'limited';
      if (hasAccess) openGalleryForSlot(index);
      else
        Alert.alert('Photo Permission Required', 'Please enable photo access in Settings.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => (Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()) },
        ]);
    } catch {
      setShowGalleryPermissionSheet(false);
      setPendingGalleryIndex(null);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleRemovePhoto = () => {
    if (selectedPhotoIndex === null) return;
    setPhotos((prev) => {
      const next = [...prev];
      next[selectedPhotoIndex] = null;
      return next;
    });
    closeActionSheet();
  };

  const displayName = user?.name ?? 'David Taylor';
  const detailRowsWithName = DETAIL_ROWS.map((row) =>
    row.key === 'name' ? { ...row, value: displayName } : row
  );

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <BackArrowIcon size={48} backgroundColor="rgba(255,255,255,0.5)" strokeColor={colors.black} />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Complete profile get matched better.</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{PROFILE_PERCENT}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.secondary.lavender, colors.primary.purple] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, styles.progressFill]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {photos.map((uri, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.photoCard, uri ? styles.photoCardFilled : null]}
                activeOpacity={0.8}
                onPress={() => openActionSheet(index)}
                disabled={uploadingSlot === index}
              >
                {uri ? (
                  <>
                    <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" />
                    <View style={styles.photoOverlay} pointerEvents="none" />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex(index);
                        setShowActionSheet(true);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CloseIcon size={14} color={colors.white} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.placeholder}>
                    <AddPhotoIcon stroke={colors.neutral[300]} />
                  </View>
                )}
                {uploadingSlot === index && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.detailsCard}>
            {detailRowsWithName.map((row, i) => (
              <React.Fragment key={row.key}>
                <TouchableOpacity
                  style={styles.detailRow}
                  activeOpacity={0.7}
                  onPress={() => {}}
                >
                  <View style={styles.detailLeft}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {row.value}
                    </Text>
                  </View>
                  <ProfileChevronRightIcon width={24} height={24} color={colors.neutral[400]} />
                </TouchableOpacity>
                {i < detailRowsWithName.length - 1 ? <View style={styles.separator} /> : null}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ReusableBottomSheet
        isOpen={showActionSheet}
        onClose={closeActionSheet}
        snapPoints={['35%']}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={true}
        backgroundStyle={sheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={sheetStyles.content}>
          <Text style={sheetStyles.title}>
            {selectedPhotoIndex !== null && photos[selectedPhotoIndex]
              ? 'Change or remove photo'
              : STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CHOOSE_ACTION_TITLE}
          </Text>
          <View style={sheetStyles.buttonsRow}>
            <TouchableOpacity style={sheetStyles.actionButton} onPress={handleCamera} activeOpacity={0.8}>
              <View style={sheetStyles.iconWrapper}>
                <ActionSheetCameraIcon size={32} color={colors.primary.purple} />
              </View>
              <Text style={sheetStyles.actionLabel}>
                {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={sheetStyles.actionButton} onPress={handleGallery} activeOpacity={0.8}>
              <View style={sheetStyles.iconWrapper}>
                <ActionSheetGalleryIcon size={32} color={colors.primary.purple} />
              </View>
              <Text style={sheetStyles.actionLabel}>
                {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.GALLERY}
              </Text>
            </TouchableOpacity>
          </View>
          {selectedPhotoIndex !== null && photos[selectedPhotoIndex] ? (
            <TouchableOpacity style={sheetStyles.removeButton} onPress={handleRemovePhoto} activeOpacity={0.8}>
              <Text style={sheetStyles.removeButtonText}>Remove photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showCameraPermissionSheet}
        onClose={() => {
          setShowCameraPermissionSheet(false);
          setPendingCameraIndex(null);
        }}
        snapPoints={['45%']}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={true}
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_DESCRIPTION}
          </Text>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
            onPress={handleAllowCameraPermission}
            variant="primary"
            disabled={isRequestingPermission}
            loading={isRequestingPermission}
            style={permissionSheetStyles.allowButton}
          />
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => {
          setShowGalleryPermissionSheet(false);
          setPendingGalleryIndex(null);
        }}
        snapPoints={['45%']}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={true}
        backgroundStyle={permissionSheetStyles.sheet}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_DESCRIPTION}
          </Text>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
            onPress={handleAllowGalleryPermission}
            variant="primary"
            disabled={isRequestingPermission}
            loading={isRequestingPermission}
            style={permissionSheetStyles.allowButton}
          />
        </View>
      </ReusableBottomSheet>
    </View>
  );
};

const sheetStyles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    maxWidth: 160,
  },
  iconWrapper: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
  },
  removeButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.semantic.error,
  },
});

const permissionSheetStyles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  allowButton: {
    width: '100%',
    height: 54,
  },
});
