import React, { useState, useMemo } from 'react';
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
  useWindowDimensions,
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

const GRID_COLUMNS = 3;
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;

export const ProfilePhotosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const gridStyles = useMemo(() => {
    const availableWidth = screenWidth - HORIZONTAL_PADDING * 2;
    const cardSize = (availableWidth - CARD_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
    return {
      grid: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: CARD_GAP,
        marginBottom: 24,
      },
      photoCard: {
        width: cardSize,
        height: cardSize,
        borderRadius: 16,
        overflow: 'hidden' as const,
        borderWidth: 1.5,
        borderStyle: 'dashed' as const,
        borderColor: colors.neutral[200],
        backgroundColor: colors.white,
      },
    };
  }, [screenWidth]);
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
    _tappedIndex: number
  ) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (!uri) return;

    // Always place in the first empty slot (position 1, 2, 3...) regardless of which slot was tapped
    const targetIndex = photos.findIndex((p) => p === null);
    if (targetIndex === -1) return; // all slots full

    const order = targetIndex + 1; // 1-based: 1st slot = order 1, 2nd = order 2, etc.

    setPhotos((prev) => {
      const next = [...prev];
      next[targetIndex] = uri;
      return next;
    });
    setUploadedSlots((prev) => {
      const next = new Set(prev);
      next.delete(targetIndex);
      return next;
    });
    setUploadingSlots((prev) => new Set(prev).add(targetIndex));
    try {
      await uploadProfilePhotoApi(uri, order);
      setUploadedSlots((prev) => new Set(prev).add(targetIndex));
    } catch (err: unknown) {
      setPhotos((prev) => {
        const next = [...prev];
        next[targetIndex] = null;
        return next;
      });
      setUploadedSlots((prev) => {
        const next = new Set(prev);
        next.delete(targetIndex);
        return next;
      });
    } finally {
      setUploadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(targetIndex);
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

          <View style={gridStyles.grid}>
            {photos.map((uri, index) => (
              (() => {
                const isUploading = uploadingSlots.has(index);
                return (
              <TouchableOpacity
                key={index}
                style={gridStyles.photoCard}
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
        snapPoints={[336]}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={true}
        backgroundStyle={permissionSheetStyles.sheet}
        backdropStyle={permissionSheetStyles.backdrop}
        dragHandleContainerStyle={permissionSheetStyles.dragHandleContainer}
        dragHandleStyle={permissionSheetStyles.dragHandle}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CAMERA_PERMISSION_DESCRIPTION}
          </Text>
          <View style={permissionSheetStyles.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAllowCameraPermission}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.primaryButton}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={permissionSheetStyles.primaryButtonGradient}
              />
              <View pointerEvents="none" style={permissionSheetStyles.primaryButtonInset} />
              {isRequestingPermission ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.primaryButtonText}>
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowCameraPermissionSheet(false);
                setPendingCameraIndex(null);
              }}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.secondaryButton}
            >
              <Text style={permissionSheetStyles.secondaryButtonText}>Don’t Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => {
          setShowGalleryPermissionSheet(false);
          setPendingGalleryIndex(null);
        }}
        snapPoints={[336]}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={true}
        backgroundStyle={permissionSheetStyles.sheet}
        backdropStyle={permissionSheetStyles.backdrop}
        dragHandleContainerStyle={permissionSheetStyles.dragHandleContainer}
        dragHandleStyle={permissionSheetStyles.dragHandle}
        scrollEnabled={false}
      >
        <View style={permissionSheetStyles.content}>
          <Text style={permissionSheetStyles.title}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_TITLE}
          </Text>
          <Text style={permissionSheetStyles.description}>
            {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.PHOTOS_PERMISSION_DESCRIPTION}
          </Text>
          <View style={permissionSheetStyles.actions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAllowGalleryPermission}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.primaryButton}
            >
              <LinearGradient
                colors={['#C671F4', '#7640F0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={permissionSheetStyles.primaryButtonGradient}
              />
              <View pointerEvents="none" style={permissionSheetStyles.primaryButtonInset} />
              {isRequestingPermission ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={permissionSheetStyles.primaryButtonText}>
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.ALLOW}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowGalleryPermissionSheet(false);
                setPendingGalleryIndex(null);
              }}
              disabled={isRequestingPermission}
              style={permissionSheetStyles.secondaryButton}
            >
              <Text style={permissionSheetStyles.secondaryButtonText}>Don’t Allow</Text>
            </TouchableOpacity>
          </View>
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
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dragHandleContainer: {
    paddingTop: 12,
    paddingBottom: 0,
  },
  dragHandle: {
    backgroundColor: '#CCCCCC',
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 32,
    left: 8,
    right: 8,
    bottom: 8,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: typography.fontFamily.regular,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    gap: 8,
  },
  primaryButton: {
    height: 56,
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  primaryButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  primaryButtonInset: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    letterSpacing: 0.32,
  },
  secondaryButton: {
    height: 56,
    width: '100%',
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[900],
    letterSpacing: 0.32,
  },
});
