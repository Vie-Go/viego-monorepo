import { resolveRoute } from '../../app/shared/lib/routing';

/**
 * Routing-guard behavior (T049) — the data-model.md state machine, including relaunch
 * session-restore / skip-to-main (FR-033) and the mid-onboarding resume guard.
 */
describe('resolveRoute (routing guard)', () => {
  it('fresh install (no language) → Language Select', () => {
    expect(
      resolveRoute({ hasChosenLanguage: false, status: 'signed-out', onboardingCompletedAt: null, leaf: undefined }),
    ).toBe('/(auth)/language');
  });

  it('stays put once already on Language Select', () => {
    expect(
      resolveRoute({ hasChosenLanguage: false, status: 'signed-out', onboardingCompletedAt: null, leaf: 'language' }),
    ).toBeNull();
  });

  it('language chosen, signed-out → Log in', () => {
    expect(
      resolveRoute({ hasChosenLanguage: true, status: 'signed-out', onboardingCompletedAt: null, leaf: 'language' }),
    ).toBe('/(auth)/login');
  });

  it('allows Register while signed-out (no bounce back to Log in)', () => {
    expect(
      resolveRoute({ hasChosenLanguage: true, status: 'signed-out', onboardingCompletedAt: null, leaf: 'register' }),
    ).toBeNull();
  });

  it('signed-in but onboarding incomplete → resume Onboarding', () => {
    expect(
      resolveRoute({ hasChosenLanguage: true, status: 'signed-in', onboardingCompletedAt: null, leaf: 'main' }),
    ).toBe('/(auth)/onboarding');
  });

  it('relaunch: signed-in + onboarding complete → skip straight to main', () => {
    expect(
      resolveRoute({
        hasChosenLanguage: true,
        status: 'signed-in',
        onboardingCompletedAt: '2026-07-23T00:00:00.000Z',
        leaf: undefined,
      }),
    ).toBe('/main');
  });

  it('stays on main once there', () => {
    expect(
      resolveRoute({
        hasChosenLanguage: true,
        status: 'signed-in',
        onboardingCompletedAt: '2026-07-23T00:00:00.000Z',
        leaf: 'main',
      }),
    ).toBeNull();
  });
});
