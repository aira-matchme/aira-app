import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BellIcon } from '../../assets/icons/common/BellIcon';
import { LikesEmptyIllustrationIcon } from '../../assets/icons/common/LikesEmptyIllustrationIcon';
import { LocationPinIcon } from '../../assets/icons/common/LocationPinIcon';
import { STRINGS } from '../../constants/strings';
import { colors } from '../../theme';
import { styles } from './styles';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type LikedProfile = {
  id: string;
  name: string;
  distance?: string;
  image?: { uri: string };
};

// Tab bar content height + padding (match TabNavigator) so last row can scroll into view
const TAB_BAR_VISIBLE_HEIGHT = 56 + 24;

export const LikesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const listBottomPadding = TAB_BAR_VISIBLE_HEIGHT + insets.bottom;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LikedProfile[]>([]);

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: response } = await apiClient.post<any>(endpoints.matches.getLikes);
      const items = response?.data?.items ?? [];

      const mapped: LikedProfile[] = items.map((item: any, index: number) => {
        const user = item.user ?? {};
        const profile = item.userMatchProfile ?? {};
        const galleryPhotos = profile.galleryPhotos ?? [];

        const imageSource =
          galleryPhotos.length > 0
            ? { uri: galleryPhotos[0].url }
            : user.profilePhoto?.url?.medium
              ? { uri: user.profilePhoto.url.medium }
              : undefined;

        return {
          id: user._id ?? item.likedUserId ?? item.id ?? String(index),
          name: user.nickName ?? user.name ?? 'Aira match',
          // Distance is not included in the sample response; omit for now
          distance: undefined,
          image: imageSource,
        };
      });

      setData(mapped);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      // Wrap so we can cancel state updates on focus loss
      (async () => {
        await fetchLikes();
        if (!isActive) return;
      })();

      return () => {
        isActive = false;
      };
    }, [fetchLikes])
  );

  return (
    <View style={styles.screen}>
            
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.neutral[50]}
        translucent={Platform.OS === 'android'}
      />
    
      {/* Full-bleed background so it extends behind status bar */}
      <View style={styles.screenFill} pointerEvents="none" />
      <View style={[styles.safe, { paddingTop: insets.top }]}>
          <View style={styles.backgroundGlow}>
        <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient
              id="nameScreenGrad"
              cx="0%"
              cy="0%"
              rx="120%"
              ry="120%"
              fx="0%"
              fy="0%"
            >
              <Stop offset="0%" stopColor="#C87BF5" stopOpacity="0.2" />
              <Stop offset="70%" stopColor="#C87BF5" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#nameScreenGrad)" />
        </Svg>
      </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{STRINGS.LIKES.TITLE}</Text>
          <TouchableOpacity style={styles.notifButton} activeOpacity={0.7}>
            <BellIcon size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        {data.length > 0 ? (
          <Text style={styles.subtitle}>{STRINGS.LIKES.SUBTITLE}</Text>
        ) : null}

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.purple} />
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <LikesEmptyIllustrationIcon size={72} color={colors.black} />
            </View>
            <View style={styles.emptyTextBlock}>
              <Text style={styles.emptyTitle}>{STRINGS.LIKES.EMPTY_TITLE}</Text>
              <Text style={styles.emptyDescription}>{STRINGS.LIKES.EMPTY_DESCRIPTION}</Text>
            </View>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={data}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={true}
            bounces={true}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[
              styles.contentPaddingBottom,
              { paddingBottom: listBottomPadding },
            ]}
            renderItem={({ item, index }) => {
              const isLeft = index % 2 === 0;
              return (
                <TouchableOpacity
                  style={[styles.card, isLeft && styles.cardLeft]}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('MatchDetails', { userId: item.id })}
                >
                  {item.image ? (
                    <Image source={item.image} style={styles.image} resizeMode="cover" />
                  ) : null}
                  <View style={styles.overlay}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.distance ? (
                      <View style={styles.distanceRow}>
                        <LocationPinIcon size={16} color={colors.neutral[200]} />
                        <Text style={styles.distance}>{item.distance}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

