import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import TabHomeActiveIcon from './active/tab-home-active.svg';
import TabChatActiveIcon from './active/tab-chat-active.svg';
import TabLikesActiveIcon from './active/tab-likes-active.svg';
import TabProfileActiveIcon from './active/tab-profile-active.svg';

export type TabBarActiveIconComponent = FC<SvgProps>;

/** Figma filled tab SVGs — shown when tab is focused */
export const TAB_BAR_ACTIVE_ICONS = {
  home: TabHomeActiveIcon,
  chat: TabChatActiveIcon,
  likes: TabLikesActiveIcon,
  profile: TabProfileActiveIcon,
} as const satisfies Record<string, TabBarActiveIconComponent>;
