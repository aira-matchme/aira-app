import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
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
import {
  EMPLOYMENT_OPTIONS,
  INCOME_OPTIONS,
  INTEREST_KEY_TO_LABEL,
  GENDER_OPTIONS,
  EDUCATION_OPTIONS,
  RELIGION_OPTIONS,
  MARITAL_OPTIONS,
  CHILDREN_OPTIONS,
} from '../../../constants/profile';
import { colors, typography } from '../../../theme';
import type { ProfileStackParamList } from '../../../navigation/types';
import { getProfileApi, uploadProfilePhotoApi, deleteProfilePhotoApi } from '../../../modules/auth/api';
import { useAuthStore } from '../../../store/auth.store';
import { styles } from './styles';
import { PROFILE_SCREEN_EDGES } from '../profileScreenLayout';

/** Extract display URL from API gallery image photo (object or string). */
function getGalleryImageUrl(photo: unknown): string | null {
  if (photo == null) return null;
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo !== null && 'url' in photo) {
    const u = (photo as { url?: unknown }).url;
    if (typeof u === 'string') return u;
    if (u && typeof u === 'object' && 'S' in (u as object)) return (u as { S?: string }).S ?? null;
  }
  return null;
}

const PHOTO_SLOTS = 6;

type PhotoSlot = { uri: string; id: string | null } | null;

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

type DetailKey =
  | 'name'
  | 'gender'
  | 'height'
  | 'education'
  | 'employment'
  | 'income'
  | 'religion'
  | 'marital'
  | 'children'
  | 'interests';

/** Shown on the list but not navigable (same policy as preferences summary gender). */
const READ_ONLY_DETAIL_KEYS = new Set<DetailKey>(['name', 'gender']);

const DETAIL_ROWS: Array<{ key: DetailKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'height', label: 'Height' },
  { key: 'education', label: 'Education' },
  { key: 'employment', label: 'Employment' },
  { key: 'income', label: 'Income' },
  { key: 'religion', label: 'Religion' },
  { key: 'marital', label: 'Marital Status' },
  { key: 'children', label: 'Children' },
  { key: 'interests', label: 'Interests' },
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(Array(PHOTO_SLOTS).fill(null));
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showCameraPermissionSheet, setShowCameraPermissionSheet] = useState(false);
  const [pendingCameraIndex, setPendingCameraIndex] = useState<number | null>(null);
  const [showGalleryPermissionSheet, setShowGalleryPermissionSheet] = useState(false);
  const [pendingGalleryIndex, setPendingGalleryIndex] = useState<number | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const showSettingsAlert = (permissionName: 'camera' | 'photos') => {
    const title =
      permissionName === 'camera'
        ? 'Camera access is turned off'
        : 'Photo access is turned off';
    const message =
      permissionName === 'camera'
        ? 'To continue, allow camera access for Aira in Settings.'
        : 'To continue, allow photo library access for Aira in Settings.';

    Alert.alert(title, message, [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => void Linking.openSettings() },
    ]);
  };
  const isPickingGalleryRef = useRef(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Sync gallery photos from user API (order-wise), with id for delete
  useEffect(() => {
    const gallery = (user as any)?.galleryImages;
    if (!Array.isArray(gallery) || gallery.length === 0) return;
    const sorted = [...gallery].sort(
      (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0)
    );
    const slots: PhotoSlot[] = Array(PHOTO_SLOTS).fill(null);
    sorted.slice(0, PHOTO_SLOTS).forEach((item: { id?: string; photo?: unknown }, i: number) => {
      const url = getGalleryImageUrl(item.photo);
      if (url) slots[i] = { uri: url, id: item.id ?? null };
    });
    setPhotoSlots(slots);
  }, [user]);

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
      return;
    }
    const uri = response.assets?.[0]?.uri;
    if (!uri) return;

    setPhotoSlots((prev) => {
      const next = [...prev];
      next[index] = { uri, id: null };
      return next;
    });

    const order = index + 1;
    setUploadingSlot(index);
    try {
      await uploadProfilePhotoApi(uri, order);
      const res = await getProfileApi();
      if ((res as any)?.galleryImages) setUser(res as any);
    } catch (err: unknown) {
      setPhotoSlots((prev) => {
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
      else showSettingsAlert('camera');
    } catch {
      setShowCameraPermissionSheet(false);
      setPendingCameraIndex(null);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const openGalleryForSlot = (index: number) => {
    // Prevent overlapping native pickers (can cause iOS picker issues)
    if (isPickingGalleryRef.current) return;
    isPickingGalleryRef.current = true;
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      isPickingGalleryRef.current = false;
      handlePickerResponse(response, index);
    });
  };

  const handleGallery = async () => {
    if (selectedPhotoIndex === null) return;
    const index = selectedPhotoIndex;
    closeActionSheet();
    const status = await checkPhotoLibraryPermission();
    const hasAccess = status === 'granted' || status === 'limited';
    if (hasAccess) {
      setPendingGalleryIndex(null);
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
      else showSettingsAlert('photos');
    } catch {
      setShowGalleryPermissionSheet(false);
      setPendingGalleryIndex(null);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Ensure we have user data; if not, fetch profile once and hydrate auth store
  useEffect(() => {
    if (!user) {
      (async () => {
        try {
          const res = await getProfileApi();
          if (res?.data) setUser(res.data);
        } catch (err) {
          // Profile fetch failed
        }
      })();
    }
  }, [user, setUser]);

  const handleRemovePhoto = async () => {
    if (selectedPhotoIndex === null) return;
    // Enforce minimum of 2 photos: if only 2 are present, do not allow deletion
    const currentFilledCount = photoSlots.filter(Boolean).length;
    if (currentFilledCount <= 2) {
      closeActionSheet();
      return;
    }
    const slot = photoSlots[selectedPhotoIndex];
    const photoId = slot?.id ?? null;
    setPhotoSlots((prev) => {
      const next = [...prev];
      next[selectedPhotoIndex] = null;
      return next;
    });
    closeActionSheet();
    if (photoId) {
      try {
        await deleteProfilePhotoApi(photoId);
        const res = await getProfileApi();
        if ((res as any)?.galleryImages != null) setUser(res as any);
      } catch {
        // Revert on failure: re-sync from user or leave slot empty
        if (user) setUser({ ...user });
      }
    }
  };

  const displayName = user?.name ?? 'David Taylor';

  /** Ensure value is a string for display; API may return objects e.g. { level, levelRank, id }. */
  const toDisplayString = (v: unknown): string | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (Array.isArray(v)) {
      const parts = v.map((item) =>
        typeof item === 'object' && item !== null && 'level' in item
          ? String((item as { level?: string }).level ?? (item as { id?: string }).id ?? '')
          : String(item),
      );
      return parts.filter(Boolean).join(', ');
    }
    if (typeof v === 'object') {
      const o = v as Record<string, unknown>;
      return String(
        o.level ??
          o.incomeRange ??
          o.religion ??
          o.label ??
          o.name ??
          o.id ??
          '',
      );
    }
    return String(v);
  };

  const getLabelFromOptions = (
    options: Array<{ key: string; label: string }>,
    raw: unknown,
  ): string | undefined => {
    const key = toDisplayString(raw);
    if (!key) return undefined;
    return options.find((o) => o.key === key)?.label;
  };

  const detailRows = useMemo(
    () =>
      DETAIL_ROWS.map((row) => {
        const u: any = user ?? {};
        let value: string | undefined;

        switch (row.key) {
          case 'name':
            value = toDisplayString(u.nickName ?? displayName);
            break;
          case 'gender':
            value =
              getLabelFromOptions(GENDER_OPTIONS as Array<{ key: string; label: string }>, u.gender) ??
              toDisplayString(u.gender);
            break;
          case 'height': {
            const feet = u.heightFeet != null ? Number(u.heightFeet) : null;
            const inches = u.heightInches != null ? Number(u.heightInches) : null;
            if (feet != null && inches != null) {
              value = `${feet} ft ${inches} in`;
            } else {
              value = toDisplayString((u.heightCm ?? u.height) as unknown);
            }
            break;
          }
          case 'education':
            value = (() => {
              const raw = (u.education as any)?.level ?? (u.education as any)?.key ?? u.education;
              return (
                getLabelFromOptions(EDUCATION_OPTIONS, raw) ??
                toDisplayString(raw)
              );
            })();
            break;
          case 'employment': {
            const employmentStatus = (u.career as any)?.employmentStatus ?? u.employment;
            const employmentOption = EMPLOYMENT_OPTIONS.find(
              (o) => o.key === employmentStatus
            );
            value = employmentOption?.label ?? toDisplayString(employmentStatus);
            break;
          }
          case 'income': {
            const incomeRange = (u.income as any)?.incomeRange ?? u.income;
            const incomeOption = INCOME_OPTIONS.find((o) => o.key === incomeRange);
            value = incomeOption?.label ?? toDisplayString(incomeRange);
            break;
          }
          case 'religion':
            value =
              getLabelFromOptions(RELIGION_OPTIONS, u.religion) ??
              toDisplayString(u.religion);
            break;
          case 'marital':
            value =
              getLabelFromOptions(MARITAL_OPTIONS, u.maritalStatus) ??
              toDisplayString(u.maritalStatus);
            break;
          case 'children':
            value =
              getLabelFromOptions(CHILDREN_OPTIONS, u.children) ??
              toDisplayString(u.children);
            break;
          case 'interests': {
            const rawList = Array.isArray(u.hobbies) ? u.hobbies : u.interests;
            if (Array.isArray(rawList)) {
              const labels = rawList
                .map((item: unknown) => {
                  const key = typeof item === 'string' ? item : (item as any)?.id ?? (item as any)?.key;
                  return key ? (INTEREST_KEY_TO_LABEL[key] ?? key) : null;
                })
                .filter(Boolean);
              value = labels.join(', ');
            } else {
              value = toDisplayString(rawList);
            }
            break;
          }
          default:
            break;
        }

        return {
          ...row,
          value: (typeof value === 'string' ? value : undefined) ?? '-',
        };
      }),
    [displayName, user],
  );

  const filledPhotoCount = photoSlots.filter(Boolean).length;
  const photoProgressPercent = Math.round((filledPhotoCount / PHOTO_SLOTS) * 100);

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={PROFILE_SCREEN_EDGES}>
      <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Complete profile get matched better.</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{photoProgressPercent}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.secondary.lavender, colors.primary.purple] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
                styles.progressFill,
                {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${photoProgressPercent}%`,
                },
              ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {[0, 3].map((rowStart) => (
              <View key={rowStart} style={styles.gridRow}>
                {photoSlots.slice(rowStart, rowStart + 3).map((slot, i) => {
                  const index = rowStart + i;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.photoCard, slot ? styles.photoCardFilled : null]}
                      activeOpacity={0.8}
                      onPress={() => openActionSheet(index)}
                      disabled={uploadingSlot === index}
                    >
                      {slot?.uri ? (
                        <>
                          <Image
                            source={{ uri: slot.uri }}
                            style={styles.photoImage}
                            resizeMode="cover"
                          />
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
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.detailsCard}>
            {detailRows.map((row, i) => {
              const isEditable = !READ_ONLY_DETAIL_KEYS.has(row.key);
              const rowInner = (
                <>
                  <View style={styles.detailLeft}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {row.value}
                    </Text>
                  </View>
                  {isEditable ? (
                    <ProfileChevronRightIcon width={24} height={24} color={colors.neutral[400]} />
                  ) : (
                    <View style={{ width: 24 }} />
                  )}
                </>
              );
              return (
                <React.Fragment key={row.key}>
                  {isEditable ? (
                    <TouchableOpacity
                      style={styles.detailRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        switch (row.key) {
                          case 'height':
                            navigation.navigate('BasicDetailsHeight', { fromEditProfile: true });
                            break;
                          case 'education':
                            navigation.navigate('BasicDetailsEducation', { fromEditProfile: true });
                            break;
                          case 'employment':
                            navigation.navigate('BasicDetailsEmployment', { fromEditProfile: true });
                            break;
                          case 'income':
                            navigation.navigate('BasicDetailsIncome', { fromEditProfile: true });
                            break;
                          case 'religion':
                            navigation.navigate('BasicDetailsReligion', { fromEditProfile: true });
                            break;
                          case 'marital':
                            navigation.navigate('BasicDetailsMaritalStatus', { fromEditProfile: true });
                            break;
                          case 'children':
                            navigation.navigate('BasicDetailsChildren', { fromEditProfile: true });
                            break;
                          case 'interests':
                            navigation.navigate('BasicDetailsInterests', { fromEditProfile: true });
                            break;
                          default:
                            break;
                        }
                      }}
                    >
                      {rowInner}
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={styles.detailRow}
                      accessibilityLabel={`${row.label}: ${row.value}`}
                      accessibilityRole="text"
                    >
                      {rowInner}
                    </View>
                  )}
                  {i < detailRows.length - 1 ? <View style={styles.separator} /> : null}
                </React.Fragment>
              );
            })}
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
            {selectedPhotoIndex !== null &&
            photoSlots[selectedPhotoIndex] &&
            photoSlots.filter(Boolean).length > 2
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
          {selectedPhotoIndex !== null &&
          photoSlots[selectedPhotoIndex] &&
          photoSlots.filter(Boolean).length > 2 ? (
            <TouchableOpacity style={sheetStyles.removeButton} onPress={handleRemovePhoto} activeOpacity={0.8}>
              <Text style={sheetStyles.removeButtonText}>Remove photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showCameraPermissionSheet}
        onClose={() => {
          if (isRequestingPermission) return;
          handleAllowCameraPermission().catch(() => {});
        }}
        snapPoints={[330]}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={false}
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
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showGalleryPermissionSheet}
        onClose={() => {
          if (isRequestingPermission) return;
          handleAllowGalleryPermission().catch(() => {});
        }}
        snapPoints={[330]}
        showDragHandle={true}
        showCloseButton={false}
        enablePanDownToClose={false}
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
                  {STRINGS.PROFILE_SETUP.PROFILE_PHOTOS.CONTINUE}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    
    color: colors.neutral[900],
    letterSpacing: 0.32,
  },
});
