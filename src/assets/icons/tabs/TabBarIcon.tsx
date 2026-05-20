import React from 'react';

import type { TabBarActiveIconComponent } from './tabBarActiveIcons';

type TabBarIconProps = {
  focused: boolean;
  ActiveIcon: TabBarActiveIconComponent;
  size: number;
  children: React.ReactNode;
};

/** Outline SVG when inactive; Figma filled SVG when active. */
export function TabBarIcon({
  focused,
  ActiveIcon,
  size,
  children,
}: TabBarIconProps) {
  if (focused) {
    return <ActiveIcon width={size} height={size} />;
  }

  return <>{children}</>;
}
