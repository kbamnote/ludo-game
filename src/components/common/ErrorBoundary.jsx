/**
 * ErrorBoundary — catches render errors so one broken screen does not take the
 * whole app down with a white screen.
 *
 * Engineering rule 15 from the brief: never silently ignore errors. In
 * development the error surfaces in full. In production it is reported (Phase 8
 * wires Sentry here) and the user gets a recoverable screen, never a crash.
 */
import { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from './Text';
import { ErrorState } from './States';
import { role, surface } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Always surface it — never swallow.
    console.error('[ErrorBoundary]', error, info?.componentStack);
    this.props.onError?.(error, info);
    // Phase 8: Sentry.captureException(error, { extra: info });
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: surface.void, paddingTop: 64 }}>
        <ErrorState
          title="This screen hit a problem"
          message={
            __DEV__
              ? 'Details below. This panel only appears in development.'
              : 'The issue has been reported. You can try again.'
          }
          onRetry={this.reset}
        />
        {__DEV__ ? (
          <ScrollView
            style={{
              maxHeight: 220,
              margin: spacing.margin,
              padding: spacing.md,
              borderRadius: radii.xl,
              backgroundColor: surface.containerLowest,
            }}
          >
            <Text variant="body-sm" color={role.error}>
              {error.toString()}
            </Text>
            {error.stack ? (
              <Text
                variant="body-sm"
                color={role.onSurfaceVariant}
                style={{ marginTop: spacing.sm }}
              >
                {error.stack}
              </Text>
            ) : null}
          </ScrollView>
        ) : null}
      </View>
    );
  }
}

export default ErrorBoundary;
