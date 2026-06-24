import React from 'react';
import { View } from 'react-native';

import { AddPhotoIcon } from '../../assets/icons/common/AddPhotoIcon';
import { BellIcon } from '../../assets/icons/common/BellIcon';
import { ShapeMatchesIcon } from '../../assets/icons/common/ShapeMatchesIcon';
import { TabChatIcon } from '../../assets/icons/tabs/TabChatIcon';
import { PlusGemIcon } from '../Subscription/components/PlusGemIcon';
import { colors } from '../../theme';
import type { NotificationIconKind } from './notificationTypes';
import { styles } from './styles';

const ICON_PURPLE = colors.primary.purple;

type Props = {
  kind: NotificationIconKind;
};

export const NotificationListIcon: React.FC<Props> = ({ kind }) => {
  switch (kind) {
    case 'subscription':
      return (
        <View style={[styles.typeIconBadge, styles.typeIconBadgeSubscription]}>
          <PlusGemIcon size={24} />
        </View>
      );
    case 'gallery':
      return (
        <View style={[styles.typeIconBadge, styles.typeIconBadgeGallery]}>
          <AddPhotoIcon width={22} height={22} stroke={ICON_PURPLE} />
        </View>
      );
    case 'match':
      return (
        <View style={[styles.typeIconBadge, styles.typeIconBadgeMatch]}>
          <ShapeMatchesIcon width={24} height={24} strokeColor={ICON_PURPLE} />
        </View>
      );
    case 'chat':
      return (
        <View style={[styles.typeIconBadge, styles.typeIconBadgeChat]}>
          <TabChatIcon width={24} height={24} color={ICON_PURPLE} />
        </View>
      );
    case 'default':
      return (
        <View style={[styles.typeIconBadge, styles.typeIconBadgeDefault]}>
          <BellIcon size={22} color={colors.neutral[600]} />
        </View>
      );
  }
};
