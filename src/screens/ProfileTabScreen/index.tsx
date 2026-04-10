import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Pressable,
  Linking,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/types';

import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { ProfileProgressRing } from '../../components/ProfileProgressRing';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing } from '../../theme';
import {
  ProfileReferralIcon,
  ProfileSubscriptionIcon,
  ProfileHelpIcon,
  ProfileChevronRightIcon,
  ProfileEditPencilIcon,
} from '../../assets/icons/profile/ProfileMenuIcons';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { LogoWordmarkGradient } from '../../assets/icons/home/LogoWordmarkGradient';
import { AiraPlusLogo } from '../../assets/icons/profile/AiraPlusLogo';
import { getPreferencesAndHydrateStore } from '../../modules/preferences/api';
import { getProfileApi } from '../../modules/auth/api';

import { styles } from './styles';
import { ReusableBottomSheet } from '../../components/BottomSheet';
import { LogoutExitIcon } from '../../assets/icons/common/LogoutExitIcon';
import { DeleteIcon } from '../../assets/icons/common/DeleteIcon';
import { InterestChipCheckIcon } from '../../assets/icons/common/InterestChipCheckIcon';
import { HomeFilterIcon } from '../../assets/icons/home/HomeFilterIcon';
import { GENDER_OPTIONS } from '../../constants/profile';
import { STRINGS } from '../../constants/strings';
import DeviceInfo from 'react-native-device-info';
import { deleteAccountApi } from '../../modules/auth/api';

const AIRA_PLUS_CARD_IMAGE = require('../../assets/images/AiraPlusCardBackground.png');
const PRIVACY_POLICY_URL = 'https://airamatchme.com/privacy';
const SUPPORT_EMAIL_URL = 'mailto:support@airamatchme.com';

const BlockedMenuIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({
  width = 20,
  color = colors.primary.purple,
}) => <BlockIcon size={width} color={color} />;

const MENU_ITEMS: Array<{
  id: string;
  label: string;
  Icon: React.FC<{ width?: number; height?: number; color?: string }>;
  screen?: keyof ProfileStackParamList;
  url?: string;
  iconColor?: string;
  action?: 'deleteAccount';
}> = [
  { id: 'preferences', label: 'Preferences', Icon: HomeFilterIcon, screen: 'PreferencesSummary', iconColor: colors.primary.purple },
  {
    id: 'blocked',
    label: STRINGS.BLOCKED_USERS.MENU,
    Icon: BlockedMenuIcon,
    screen: 'BlockedUsers',
    iconColor: colors.primary.purple,
  },
  // { id: 'referral', label: 'Referral Points', Icon: ProfileReferralIcon },
  // { id: 'subscription', label: 'My Subscription', Icon: ProfileSubscriptionIcon },
  { id: 'help', label: 'Help Center', Icon: ProfileHelpIcon, url: SUPPORT_EMAIL_URL },
  { id: 'privacy', label: 'Privacy & Terms', Icon: ProfileHelpIcon, url: PRIVACY_POLICY_URL },
  // {
  //   id: 'delete-account',
  //   label: STRINGS.PROFILE_TAB.DELETE_ACCOUNT,
  //   Icon: DeleteIcon,
  //   iconColor: colors.semantic.error,
  //   action: 'deleteAccount',
  // },
];

type ProfileMainNav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const PHOTO_SLOTS = 6;
const DELETE_REASON_OPTIONS = [
  'I have privacy concerns',
  'I am not getting good matches',
  'I found someone',
  'The app is hard to use',
  'I get too many notifications',
] as const;

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
export const ProfileTabScreen = () => {
  const navigation = useNavigation<ProfileMainNav>();
  const insets = useSafeAreaInsets();
  const { user, logout, setUser } = useAuthStore();
  const [profileImage, setProfileImage] = useState<ImageSourcePropType | null>(null);
  const [galleryCount, setGalleryCount] = useState(0);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedDeleteReason, setSelectedDeleteReason] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadProfile = async () => {
        try {
          const profile = await getProfileApi();
          if (profile?.data) {
            // Keep auth store in sync with latest profile
            setUser(profile.data as any);

            const galleryImages = (profile.data as any)?.galleryImages;
            const filledCount = Array.isArray(galleryImages)
              ? galleryImages.filter((img: any) => getGalleryImageUrl(img?.photo)).length
              : 0;
            setGalleryCount(Math.min(filledCount, PHOTO_SLOTS));

            const photo =
              (profile.data as any)?.profilePhoto?.url?.medium ??
              (profile.data as any)?.profilePhoto?.url?.original ??
              (profile.data as any)?.profilePicture;
            if (typeof photo === 'string' && photo.length > 0) {
              setProfileImage({ uri: photo });
              return;
            }
          }

          // Fallback to bundled placeholder if API has no photo
          try {
            const local = require('../../assets/images/ProfileImage.png');
            setProfileImage(local);
          } catch {
            setProfileImage(null);
          }
          setGalleryCount(0);
        } catch {
          // On error, fall back to any existing store user / local image
          try {
            const local = require('../../assets/images/ProfileImage.png');
            setProfileImage(local);
          } catch {
            setProfileImage(null);
          }
          setGalleryCount(0);
        }
      };

      loadProfile();
    }, [setUser])
  );

  const displayName =
    (user as any)?.nickName ??
    (user as any)?.nickname ??
    user?.name ??
    'Guest';

  const appVersionLabel = React.useMemo(() => {
    const v = DeviceInfo.getVersion();
    const build = DeviceInfo.getBuildNumber();
    return build ? `Version ${v}-${build}` : `Version ${v}`;
  }, []);

  const genderKey = (user as any)?.gender;
  const genderDisplay =
    typeof genderKey === 'string' && genderKey.length > 0
      ? GENDER_OPTIONS.find((o) => o.key === genderKey)?.label ?? genderKey
      : '';

  const profilePercent = Math.round((galleryCount / PHOTO_SLOTS) * 100);

  const onEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const onMenuPress = async (menuItem: (typeof MENU_ITEMS)[number]) => {
    if (menuItem.action === 'deleteAccount') {
      setDeleteConfirmVisible(true);
      return;
    }

    if (menuItem.url) {
      try {
        // External links (privacy policy, support mail) should always open.
        await Linking.openURL(menuItem.url);
      } catch {
        // Ignore; user can still tap other menu items.
      }
      return;
    }

    const screen = menuItem.screen;
    if (screen === 'PreferencesSummary') {
      try {
        await getPreferencesAndHydrateStore();
      } catch {
        // If fetching fails, still allow navigation with existing store values.
      }
      navigation.navigate('PreferencesSummary');
      return;
    }
    if (screen) {
      navigation.navigate(screen as never);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteLoading) return;
    const picked = selectedDeleteReason ?? '';
    const typed = deleteReason.trim();
    const reason = picked && typed ? `${picked}. Other: ${typed}` : picked || typed;
    if (!reason) return;
    setDeleteLoading(true);
    try {
      await deleteAccountApi(reason);
      setDeleteConfirmVisible(false);
      setDeleteReason('');
      setSelectedDeleteReason(null);
      await logout();
    } catch {
      // API interceptor handles user-facing error.
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleDeleteReason = (value: string) => {
    setSelectedDeleteReason((prev) => (prev === value ? null : value));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileScreenGradient />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile header */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image source={profileImage} style={styles.avatarImage} resizeMode="cover" />
                ) : null}
              </View>
              <View style={styles.progressRing} pointerEvents="none">
                <ProfileProgressRing size={106} />
              </View>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>{profilePercent}%</Text>
              </View>
            </View>
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{displayName}</Text>
                {/* <VerifiedIcon size={24} color={colors.neutral[500]} /> */}
              </View>
              {genderDisplay ? (
                <Text style={styles.genderReadOnly}>{genderDisplay}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.editButton} onPress={onEditProfile} activeOpacity={0.8}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
              <ProfileEditPencilIcon width={16} height={16} />
            </TouchableOpacity>
          </View>

          {/* Aira Plus card — Figma 2101-28021 */}
          {/* <TouchableOpacity style={styles.airaPlusCard} activeOpacity={0.95}>
            <Image
              source={AIRA_PLUS_CARD_IMAGE}
              style={styles.airaPlusBackgroundImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'transparent'] as [string, string]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.airaPlusGradientOverlay}
            />
            <View style={styles.airaPlusOverlayTint} />
            <View style={styles.airaPlusOverlay} pointerEvents="box-none">
              <View style={styles.airaPlusLogo}>
                <AiraPlusLogo width={66} height={48} color={colors.white} />
              </View>
              <View style={styles.airaPlusTextBlock}>
                <Text style={styles.airaPlusText}>
                  See more. Understand better.{'\n'}Connect smarter.
                </Text>
                <Pressable style={styles.airaPlusButton} onPress={() => {}}>
                  <LinearGradient
                    colors={[colors.secondary.lavender, colors.primary.purple] as [string, string]}
                    start={{ x: 0.15, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={styles.airaPlusButtonGradient}
                  />
                  <Text style={styles.airaPlusButtonText}>Upgrade Plan</Text>
                </Pressable>
              </View>
            </View>
          </TouchableOpacity> */}

          {/* Menu list */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((menuItem) => (
              <TouchableOpacity
                key={menuItem.id}
                style={styles.menuRow}
                onPress={() => onMenuPress(menuItem)}
                activeOpacity={0.7}
              >
                <View style={styles.menuRowLeft}>
                  <menuItem.Icon width={20} height={20} color={menuItem.iconColor} />
                  <Text
                    style={[
                      styles.menuRowLabel,
                      menuItem.action === 'deleteAccount' && styles.menuRowLabelDanger,
                    ]}
                  >
                    {menuItem.label}
                  </Text>
                </View>
                <ProfileChevronRightIcon width={24} height={24} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer: logo, version, logout */}
          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <LogoWordmarkGradient width={116} height={56} />
            </View>
            <Text style={styles.version}>{appVersionLabel}</Text>
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setLogoutConfirmVisible(true)}
                activeOpacity={0.9}
              >
                <View style={styles.logoutContent}>
                  <LogoutExitIcon size={18} color={colors.semantic.error} />
                  <Text style={styles.logoutText}>{STRINGS.PROFILE_TAB.LOGOUT}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={() => setDeleteConfirmVisible(true)}
                activeOpacity={0.9}
              >
                <View style={styles.deleteAccountContent}>
                  <DeleteIcon size={18} color={colors.black} />
                  <Text style={styles.deleteAccountText}>Delete Account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ReusableBottomSheet
        isOpen={logoutConfirmVisible}
        onClose={() => setLogoutConfirmVisible(false)}
        snapPoints={[380, 400]}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        scrollEnabled={false}
        backdropStyle={styles.logoutSheetBackdrop}
        backgroundStyle={[
          styles.logoutSheetFloatingCard,
          { marginBottom: spacing.md + insets.bottom },
        ]}
      >
        <View
          style={[
            styles.logoutSheetBody,
            { paddingBottom: spacing.lg + Math.max(insets.bottom, 0) },
          ]}
        >
          <View style={styles.logoutSheetHeader}>
            <View style={styles.logoutSheetIconCircle}>
              <LogoutExitIcon size={40} color={colors.primary.purple} />
            </View>
            <Text style={styles.logoutSheetTitle}>{STRINGS.PROFILE_TAB.LOGOUT_TITLE}</Text>
            <Text style={styles.logoutSheetMessage}>{STRINGS.PROFILE_TAB.LOGOUT_MESSAGE}</Text>
          </View>
          <View style={styles.logoutSheetActions}>
            <TouchableOpacity
              style={styles.logoutSheetStayButton}
              activeOpacity={0.9}
              onPress={() => setLogoutConfirmVisible(false)}
            >
              <LinearGradient
                colors={[...colors.gradients.primary.colors]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.logoutSheetStayGradient}
              />
              <Text style={styles.logoutSheetStayLabel}>{STRINGS.PROFILE_TAB.STAY}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutSheetConfirmButton}
              activeOpacity={0.85}
              onPress={() => {
                setLogoutConfirmVisible(false);
                logout();
              }}
            >
              <Text style={styles.logoutSheetConfirmLabel}>{STRINGS.PROFILE_TAB.LOGOUT}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={deleteConfirmVisible}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setDeleteReason('');
          setSelectedDeleteReason(null);
        }}
        snapPoints={['90%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose={!deleteLoading}
        scrollEnabled={false}
        backdropStyle={styles.logoutSheetBackdrop}
        backgroundStyle={[
          styles.logoutSheetFloatingCard,
          { marginBottom: spacing.md + insets.bottom },
        ]}
      >
        <View
          style={[
            styles.deleteSheetBody,
            { paddingBottom: spacing.lg + Math.max(insets.bottom, 0) },
          ]}
        >
          <View style={styles.deleteSheetHeader}>
            <View style={styles.deleteSheetIconCircle}>
              <DeleteIcon size={40} color={colors.semantic.error} />
            </View>
            <Text style={styles.deleteSheetTitle}>{STRINGS.PROFILE_TAB.DELETE_ACCOUNT_TITLE}</Text>
            <Text style={styles.deleteSheetMessage}>{STRINGS.PROFILE_TAB.DELETE_ACCOUNT_MESSAGE}</Text>
            <View style={styles.deleteReasonList}>
              {DELETE_REASON_OPTIONS.map((reason) => {
                const selected = selectedDeleteReason === reason;
                return (
                  <Pressable
                    key={reason}
                    style={[
                      styles.deleteReasonRow,
                      selected && styles.deleteReasonRowSelected,
                    ]}
                    onPress={() => toggleDeleteReason(reason)}
                    disabled={deleteLoading}
                  >
                    <View
                      style={[
                        styles.deleteReasonCheckbox,
                        selected && styles.deleteReasonCheckboxSelected,
                      ]}
                    >
                      {selected ? (
                        <InterestChipCheckIcon size={12} color={colors.white} />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.deleteReasonRowLabel,
                        selected && styles.deleteReasonRowLabelSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.deleteReasonInputWrap}>
              <TextInput
                value={deleteReason}
                onChangeText={setDeleteReason}
                placeholder={STRINGS.PROFILE_TAB.DELETE_REASON_PLACEHOLDER}
                placeholderTextColor={colors.neutral[400]}
                style={styles.deleteReasonInput}
                editable={!deleteLoading}
                maxLength={240}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
          <View style={styles.deleteSheetActions}>
            <TouchableOpacity
              style={styles.deleteSheetCancelButton}
              activeOpacity={0.85}
              onPress={() => {
                setDeleteConfirmVisible(false);
                setDeleteReason('');
                setSelectedDeleteReason(null);
              }}
              disabled={deleteLoading}
            >
              <Text style={styles.deleteSheetCancelLabel}>{STRINGS.PROFILE_TAB.CANCEL}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteSheetDeleteButton,
                !selectedDeleteReason &&
                  !deleteReason.trim() &&
                  styles.deleteSheetDeleteButtonDisabled,
              ]}
              activeOpacity={0.9}
              onPress={handleDeleteAccount}
              disabled={
                deleteLoading ||
                (!selectedDeleteReason && !deleteReason.trim())
              }
            >
              {!selectedDeleteReason && !deleteReason.trim() ? (
                <View style={styles.deleteSheetDeleteGradient}>
                  <Text style={styles.deleteSheetDeleteLabel}>{STRINGS.PROFILE_TAB.DELETE}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={[...colors.gradients.primary.colors]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.deleteSheetDeleteGradient}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.deleteSheetDeleteLabel}>{STRINGS.PROFILE_TAB.DELETE}</Text>
                  )}
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>
    </View>
  );
};
