import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { STRINGS } from '../../constants/strings';
import { colors } from '../../theme';
import { useWaitlistStore } from '../../store/waitlist.store';
import {
  WAITLIST_LOGO_HEIGHT,
  WAITLIST_LOGO_WIDTH,
  scaleWaitlist,
} from './layout';
import { WaitlistBackground } from './components/WaitlistBackground';
import { WaitlistPremiumCard } from './components/WaitlistPremiumCard';
import { styles } from './styles';

const LOGO = require('../../assets/images/waitlist/logo.png');
const EARLY_DAYS_ICON = require('../../assets/images/waitlist/early-days-icon.png');
const EARN_ICON = require('../../assets/images/waitlist/earn-icon.png');

const EARNING_URL = 'https://airamatchme.com';

export const WaitlistScreen: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setHasEnteredApp = useWaitlistStore((s) => s.setHasEnteredApp);

  const logoSize = useMemo(
    () => ({
      width: scaleWaitlist(windowWidth, WAITLIST_LOGO_WIDTH),
      height: scaleWaitlist(windowWidth, WAITLIST_LOGO_HEIGHT),
    }),
    [windowWidth],
  );

  const handleEnterAira = useCallback(() => {
    setHasEnteredApp(true);
  }, [setHasEnteredApp]);

  const handleExploreEarning = useCallback(() => {
    Linking.openURL(EARNING_URL).catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <WaitlistBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Image
              source={LOGO}
              style={[styles.logo, { width: logoSize.width, height: logoSize.height }]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />

            <View style={styles.heroBlock}>
              <Text style={styles.titleLine}>{STRINGS.WAITLIST.TITLE_LINE_1}</Text>
              <Text style={styles.titleLine}>{STRINGS.WAITLIST.TITLE_LINE_2}</Text>
              <Text style={styles.subtitle}>{STRINGS.WAITLIST.SUBTITLE}</Text>
            </View>

            <View style={styles.cardsBlock}>
              <WaitlistPremiumCard />

              <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrap}>
                    <Image
                      source={EARLY_DAYS_ICON}
                      style={styles.infoIcon}
                      resizeMode="contain"
                      accessibilityIgnoresInvertColors
                    />
                  </View>
                  <Text style={styles.infoTitleLine}>{STRINGS.WAITLIST.EARLY_DAYS_TITLE_LINE_1}</Text>
                  <Text style={styles.infoTitleLine}>{STRINGS.WAITLIST.EARLY_DAYS_TITLE_LINE_2}</Text>
                  <Text style={styles.infoDescriptionLine}>
                    {STRINGS.WAITLIST.EARLY_DAYS_DESCRIPTION_LINE_1}
                  </Text>
                  <Text style={styles.infoDescriptionLine}>
                    {STRINGS.WAITLIST.EARLY_DAYS_DESCRIPTION_LINE_2}
                  </Text>
                  <View style={styles.infoCardInnerGlow} pointerEvents="none" />
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrap}>
                    <Image
                      source={EARN_ICON}
                      style={styles.infoIcon}
                      resizeMode="contain"
                      accessibilityIgnoresInvertColors
                    />
                  </View>
                  <Text style={styles.infoTitleLine}>{STRINGS.WAITLIST.EARN_TITLE_LINE_1}</Text>
                  <Text style={styles.infoTitleLine}>{STRINGS.WAITLIST.EARN_TITLE_LINE_2}</Text>
                  <Text style={styles.infoDescriptionLine}>
                    {STRINGS.WAITLIST.EARN_DESCRIPTION_LINE_1}
                  </Text>
                  <Text style={styles.infoDescriptionLine}>
                    {STRINGS.WAITLIST.EARN_DESCRIPTION_LINE_2}
                  </Text>
                  <View style={styles.infoCardInnerGlow} pointerEvents="none" />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={handleEnterAira}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.WAITLIST.ENTER_CTA}
            >
              <Text style={styles.primaryButtonText}>{STRINGS.WAITLIST.ENTER_CTA}</Text>
              <ForwardArrowIcon size={24} color={colors.black} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.75}
              onPress={handleExploreEarning}
              accessibilityRole="link"
            >
              <Text style={styles.secondaryButtonText}>
                {STRINGS.WAITLIST.EXPLORE_EARNING}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
