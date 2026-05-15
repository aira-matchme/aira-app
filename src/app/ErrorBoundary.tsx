import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(typeof value === 'string' ? value : 'Unknown error');
}

/**
 * Catches render/lifecycle errors in descendants so one bad screen does not white-screen the whole app.
 * Reports to Sentry when configured; offers "Try again" to reset boundary state.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { hasError: true, error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    const err = toError(error);
    Sentry.captureException(err, {
      contexts: {
        react: {
          componentStack: info.componentStack,
        },
      },
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const err = this.state.error;
      return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.body}>
                A problem occurred while showing this screen. You can try again. If it keeps
                happening, restart the app.
              </Text>
              {__DEV__ && err?.message ? (
                <Text style={styles.devDetail} selectable>
                  {err.message}
                </Text>
              ) : null}
              <Button title="Try again" onPress={this.handleReset} variant="primary" />
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.h2Semibold,
    color: colors.neutral[900],
  },
  body: {
    ...typography.body,
    color: colors.neutral[600],
  },
  devDetail: {
    ...typography.small,
    color: colors.neutral[500],
  },
});
