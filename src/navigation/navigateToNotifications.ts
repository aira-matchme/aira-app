import { CommonActions, type NavigationProp, type ParamListBase } from '@react-navigation/native';

function findNavigatorWithRoute(
  navigation: NavigationProp<ParamListBase>,
  routeName: string,
): NavigationProp<ParamListBase> | undefined {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const routeNames = current.getState()?.routeNames ?? [];
    if (routeNames.includes(routeName)) {
      return current;
    }
    current = current.getParent();
  }

  return undefined;
}

/** Open Notifications from Dashboard, a tab screen, or any nested stack under tabs. */
export function navigateToNotifications(
  navigation: NavigationProp<ParamListBase>,
): void {
  const homeStack = findNavigatorWithRoute(navigation, 'Notifications');
  if (homeStack) {
    homeStack.navigate('Notifications');
    return;
  }

  const tabNav = findNavigatorWithRoute(navigation, 'Home');
  if (tabNav) {
    tabNav.navigate('Home', { screen: 'Notifications' });
    return;
  }

  navigation.dispatch(
    CommonActions.navigate({
      name: 'Tabs',
      params: {
        screen: 'Home',
        params: { screen: 'Notifications' },
      },
    }),
  );
}
