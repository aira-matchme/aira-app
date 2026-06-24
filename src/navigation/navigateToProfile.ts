type NavigationLike = {
  navigate: (name: string, params?: object) => void;
  getParent?: () => NavigationLike | undefined;
};

/** Navigate to Profile tab main screen from tab stacks or the root stack. */
export function navigateToProfileMain(navigation: NavigationLike): void {
  const tabNav = navigation.getParent?.();

  if (tabNav) {
    tabNav.navigate('Profile', { screen: 'ProfileMain' });
    return;
  }

  navigation.navigate('Tabs', {
    screen: 'Profile',
    params: { screen: 'ProfileMain' },
  });
}

/** Navigate to Profile → Edit Profile (gallery photos). */
export function navigateToEditProfile(navigation: NavigationLike): void {
  const tabNav = navigation.getParent?.();

  if (tabNav) {
    tabNav.navigate('Profile', { screen: 'EditProfile' });
    return;
  }

  navigation.navigate('Tabs', {
    screen: 'Profile',
    params: { screen: 'EditProfile' },
  });
}
