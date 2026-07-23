import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import OnboardingScreen from '../../app/(auth)/onboarding';
import { useSessionStore } from '../../app/shared/store/sessionStore';

function resetSession() {
  useSessionStore.setState({
    explorerId: 'exp_test',
    status: 'signed-in',
    onboardingCompletedAt: null,
  });
}

describe('Onboarding screen', () => {
  beforeEach(() => resetSession());

  it('starts on the first slide with a 3-segment progress bar', () => {
    const { getByTestId } = renderWithProviders(<OnboardingScreen />);
    const progress = getByTestId('onboarding-progress');
    expect(progress.props.accessibilityValue).toMatchObject({ min: 0, max: 3, now: 1 });
    expect(getByTestId('onboarding-cta')).toBeTruthy();
  });

  it('advances through slides on CTA tap and completes on the last', () => {
    const { getByTestId } = renderWithProviders(<OnboardingScreen />);
    const cta = getByTestId('onboarding-cta');

    fireEvent.press(cta); // slide 1 → 2
    expect(getByTestId('onboarding-progress').props.accessibilityValue.now).toBe(2);
    fireEvent.press(cta); // slide 2 → 3
    expect(getByTestId('onboarding-progress').props.accessibilityValue.now).toBe(3);

    fireEvent.press(cta); // finish
    expect(useSessionStore.getState().onboardingCompletedAt).toBeTruthy();
  });

  it('completes immediately when Skip is used', () => {
    const { getByTestId } = renderWithProviders(<OnboardingScreen />);
    fireEvent.press(getByTestId('onboarding-skip'));
    expect(useSessionStore.getState().onboardingCompletedAt).toBeTruthy();
  });
});
