/**
 * Pure routing-guard decision from data-model.md's state-transition diagram. Extracted from the
 * `RoutingGuard` component so it's unit-testable in isolation (T049) without the CSS/font/splash
 * side effects of importing `_layout.tsx`.
 *
 * Returns the route to redirect to, or `null` if the current leaf is already an allowed screen.
 */
export interface GuardState {
  hasChosenLanguage: boolean;
  status: 'signed-out' | 'signed-in';
  onboardingCompletedAt: string | null;
  /** The last path segment of the current route (e.g. 'login', 'onboarding', 'main'). */
  leaf: string | undefined;
}

export function resolveRoute(state: GuardState): string | null {
  const { hasChosenLanguage, status, onboardingCompletedAt, leaf } = state;

  if (!hasChosenLanguage) {
    return leaf === 'language' ? null : '/(auth)/language';
  }
  if (status === 'signed-out') {
    return leaf === 'login' || leaf === 'register' ? null : '/(auth)/login';
  }
  if (status === 'signed-in' && !onboardingCompletedAt) {
    // Guards the backgrounded-mid-onboarding edge case (US2 scenario 4).
    return leaf === 'onboarding' ? null : '/(auth)/onboarding';
  }
  // signed-in + onboarding complete → main (session restore on relaunch, FR-033)
  return leaf === 'main' ? null : '/main';
}
