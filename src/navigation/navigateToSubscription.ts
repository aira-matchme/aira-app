type NavigationLike = {
  navigate: (name: string, params?: object) => void;
  getParent?: () => NavigationLike | undefined;
};

/** Navigate to Profile → Subscription from tab stacks or the root stack. */
export function navigateToSubscription(navigation: NavigationLike): void {
  const tabNav = navigation.getParent?.();

  if (tabNav) {
    tabNav.navigate('Profile', { screen: 'Subscription' });
    return;
  }

  navigation.navigate('Tabs', {
    screen: 'Profile',
    params: { screen: 'Subscription' },
  });
}
