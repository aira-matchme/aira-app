import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/types';

import { ProfileScreenGradient } from '../../components/ProfileScreenGradient';
import { ProfileProgressRing } from '../../components/ProfileProgressRing';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme';
import {
  ProfilePreferencesIcon,
  ProfileReferralIcon,
  ProfileSubscriptionIcon,
  ProfileHelpIcon,
  ProfilePrivacyIcon,
  ProfileChevronRightIcon,
  ProfileEditPencilIcon,
} from '../../assets/icons/profile/ProfileMenuIcons';
import { VerifiedIcon } from '../../assets/icons/common/VerifiedIcon';
import { LogoWordmarkGradient } from '../../assets/icons/home/LogoWordmarkGradient';
import { AiraPlusLogo } from '../../assets/icons/profile/AiraPlusLogo';
import { getPreferencesAndHydrateStore } from '../../modules/preferences/api';

import { styles } from './styles';
import { HomeFilterIcon } from '../../assets/icons/home/HomeFilterIcon';

const AIRA_PLUS_CARD_IMAGE = require('../../assets/images/AiraPlusCardBackground.png');

const MENU_ITEMS: Array<{
  id: string;
  label: string;
  Icon: React.FC<{ width?: number; height?: number; color?: string }>;
  screen?: string;
  iconColor?: string;
}> = [
  { id: 'preferences', label: 'Preferences', Icon: HomeFilterIcon, screen: 'PreferencesSummary', iconColor: colors.primary.purple },
  { id: 'referral', label: 'Referral Points', Icon: ProfileReferralIcon },
  { id: 'subscription', label: 'My Subscription', Icon: ProfileSubscriptionIcon },
  { id: 'help', label: 'Help Center', Icon: ProfileHelpIcon },
  { id: 'privacy', label: 'Privacy & Terms', Icon: ProfileHelpIcon },
];

function getProfileImageSource(): ImageSourcePropType | null {
  try {
    return require('../../assets/images/ProfileImage.png');
  } catch {
    return null;
  }
}

type ProfileMainNav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const PHOTO_SLOTS = 6;

export const ProfileTabScreen = () => {
  const navigation = useNavigation<ProfileMainNav>();
  const { user, logout } = useAuthStore();
  const displayName = user?.name ?? 'David Taylor';
  const profileImage = getProfileImageSource();
  const galleryCount = (user as { galleryImages?: unknown[] })?.galleryImages?.length ?? 0;
  const profilePercent = Math.round((galleryCount / PHOTO_SLOTS) * 100);

  const onEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const onMenuPress = async (screen?: string) => {
    if (screen === 'PreferencesSummary') {
      try {
        await getPreferencesAndHydrateStore();
      } catch {
        // If fetching fails, still allow navigation with existing store values.
      }
      navigation.navigate('PreferencesSummary');
    }
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
            <View style={styles.nameRow}>
              <Text style={styles.name}>{displayName}</Text>
              <VerifiedIcon size={24} color={colors.neutral[500]} />
            </View>
            <TouchableOpacity style={styles.editButton} onPress={onEditProfile} activeOpacity={0.8}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
              <ProfileEditPencilIcon width={16} height={16} />
            </TouchableOpacity>
          </View>

          {/* Aira Plus card — Figma 2101-28021 */}
          <TouchableOpacity style={styles.airaPlusCard} activeOpacity={0.95}>
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
          </TouchableOpacity>

          {/* Menu list */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map(({ id, label, Icon, screen, iconColor }) => (
              <TouchableOpacity
                key={id}
                style={styles.menuRow}
                onPress={() => onMenuPress(screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuRowLeft}>
                  <Icon width={20} height={20} color={iconColor} />
                  <Text style={styles.menuRowLabel}>{label}</Text>
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
            <Text style={styles.version}>Version 2026.0.1-123</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.9}>
              <LinearGradient
                colors={[colors.secondary.lavender, colors.primary.purple] as [string, string]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.logoutGradient}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
