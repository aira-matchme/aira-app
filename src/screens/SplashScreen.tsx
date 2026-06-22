import React, { useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme';
import { LogoIcon } from '../assets/icons/branding/LogoIcon';
import { useAuthStore } from '../store/auth.store';
import { useSubscriptionStore } from '../store/subscription.store';
import { useMe } from '../modules/auth/hooks';
import { checkNotificationPermission } from '../config/permissions';
import type { RootStackParamList } from '../navigation/types';

const ELLIPSE_BACKGROUND = 'https://www.figma.com/api/mcp/asset/01e902af-440b-49ff-a38a-dbc06cb487ea';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { accessToken, setUser, setLoading, logout, initialize, setShouldShowEnableNotifications } = useAuthStore();
  const syncFromProfile = useSubscriptionStore((s) => s.syncFromProfile);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasNavigatedRef = useRef(false); // Prevent multiple navigations using ref
  const hasToken = !!accessToken;
  
  // Enable profile fetch if we have a token and initialization is complete
  const { data, error, isLoading: isFetchingProfile } = useMe(hasToken && isInitialized);

  // Initialize auth state on mount (load tokens from storage)
  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitialized(true);
    };
    init();
  }, [initialize]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    if (!isInitialized) {
      return;
    }

    if (!hasToken) {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      setLoading(false);
      return;
    }

    if (isFetchingProfile) {
      setLoading(true);
      return;
    }

    if (data?.data) {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      setUser(data.data);
      syncFromProfile(data.data as Record<string, unknown>);

      // Check notification permission - redirect to EnableNotifications if not granted
      (async () => {
        try {
          const notificationStatus = await checkNotificationPermission();
          if (notificationStatus !== 'granted') {
            setShouldShowEnableNotifications(true);
          }
        } catch (e) {
          setShouldShowEnableNotifications(true);
        }
        setLoading(false);
      })();
      return;
    } else if (error) {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      logout();
      setLoading(false);
    }
  }, [isInitialized, hasToken, data, error, isFetchingProfile, setUser, setLoading, logout, setShouldShowEnableNotifications, syncFromProfile, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Figma Primary Gradient */}
      <LinearGradient
        colors={[...colors.gradients.primary.colors]}
        start={colors.gradients.primary.start}
        end={colors.gradients.primary.end}
        style={styles.gradient}
      >
        {/* Background ellipse/circle */}
        <View style={styles.ellipseContainer}>
          <Image
            source={{ uri: ELLIPSE_BACKGROUND }}
            style={styles.ellipse}
            resizeMode="contain"
          />
        </View>

        {/* Centered Logo */}
        <View style={styles.logoContainer}>
            {/* <Image
                source={{ uri: LOGO_WHITE }}
                style={styles.logo}
                resizeMode="contain"
            /> */}
            <LogoIcon  size={200}/>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipseContainer: {
    position: 'absolute',
    width: 600,
    height: 600,
    top: -293,
    left: '25%',
    opacity: 0.3,
  },
  ellipse: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

