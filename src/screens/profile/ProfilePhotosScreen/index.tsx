import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
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
import { ActionSheetCameraIcon } from '../../../assets/icons/common/ActionSheetCameraIcon';
import { ActionSheetGalleryIcon } from '../../../assets/icons/common/ActionSheetGalleryIcon';
import { InformativeIcon } from '../../../assets/icons/common/InformativeIcon';
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
import type { AuthStackParamList } from '../../../navigation/types';
import { uploadProfilePhotoApi } from '../../../modules/auth/api';
import { styles } from './styles';

const PHOTO_SLOTS = 6;
const MIN_PHOTOS_REQUIRED = 2;

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ProfilePhotos'>;

export const ProfilePhotosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [photos, setPhotos] = useState<(string | null)[]>(
    Array(PHOTO_SLOTS).fill(null)
  );
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [pendingCameraIndex, setPendingCameraIndex] = useState<number | null>(null);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [pendingGalleryIndex, setPendingGalleryIndex] = useState<number | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [uploadingSlots, setUploadingSlots] = useState<Set<number>>(new Set());
  const [uploadedSlots, setUploadedSlots] = useState<Set<number>>(new Set());

  const handlePickerResponse = async (
    response: { didCancel?: boolean; errorCode?: string; errorMessage?: string; assets?: Array<{ uri?: string }> },
    index: number
  ) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (!uri) return;

    setPhotos((prev) => {
      const next = [...prev];
      next[index] = uri;
      return next;
    });
    setUploadedSlots((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });

    const order = index + 1; // 1-based: 1st slot = 1, 6th slot = 6
    setUploadingSlots((prev) => new Set(prev).add(index));
    try {
      await uploadProfilePhotoApi(uri, order);
      setUploadedSlots((prev) => new Set(prev).add(index));
    } catch (err: unknown) {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setUploadedSlots((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    } finally {
      setUploadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
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
    launchCamera(
      { mediaType: 'photo', quality: 0.8 },
      (response) => handlePickerResponse(response, index)
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
      if (status === 'granted') {
        openCameraForSlot(index);
      }
    } catch {
      setShowCameraPermissionSheet(false);
      setPendingCameraIndex(null);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const openGalleryForSlot = (index: number) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => handlePickerResponse(response, index)
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
      if (hasAccess) {
        openGalleryForSlot(index);
      }
    } catch {
      setShowGalleryPermissionSheet(false);
      setPendingGalleryIndex(null);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const successfulUploadCount = uploadedSlots.size;
  const canContinue = successfulUploadCount >= MIN_PHOTOS_REQUIRED;

  const handleContinue = () => {
    if (!canContinue) return;
    navigation.navigate('OnboardingIntro');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <BackArrowIcon size={48} backgroundColor="#FFFFFF" strokeColor="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.TITLE}
          </Text>

          <View style={styles.grid}>
            {photos.map((uri, index) => (
              (() => {
                const isUploading = uploadingSlots.has(index);
                return (
              <TouchableOpacity
                key={index}
                style={styles.photoCard}
                activeOpacity={0.8}
                onPress={() => openActionSheet(index)}
                disabled={isUploading}
              >
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <AddPhotoIcon stroke={colors.neutral[300]} />
                  </View>
                )}
                {isUploading && (
                  <View style={sheetStyles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
                );
              })()
            ))}
          </View>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletText}>
              • {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.BULLET_1}
            </Text>
            <Text style={styles.bulletText}>
              • {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.BULLET_2}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}
            onPress={handleContinue}
            variant="primary"
            disabled={!canContinue}
            style={styles.button}
          />
          <View style={styles.tipBanner}>
            <InformativeIcon />
            <Text style={styles.tipText}>
              {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.MATCHES_TIP}
            </Text>
          </View>
        </View>
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
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CHOOSE_ACTION_TITLE}
          </Text>
          <View style={sheetStyles.buttonsRow}>
            <TouchableOpacity
              style={sheetStyles.actionButton}
              onPress={handleCamera}
              activeOpacity={0.8}
            >
              <View style={sheetStyles.iconWrapper}>
                <ActionSheetCameraIcon size={32} color={colors.primary.purple} />
              </View>
              <Text style={sheetStyles.actionLabel}>
                {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={sheetStyles.actionButton}
              onPress={handleGallery}
              activeOpacity={0.8}
            >
              <View style={sheetStyles.iconWrapper}>
                <ActionSheetGalleryIcon size={32} color={colors.primary.purple} />
              </View>
              <Text style={sheetStyles.actionLabel}>
                {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.GALLERY}
              </Text>
            </TouchableOpacity>
          </View>
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
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
