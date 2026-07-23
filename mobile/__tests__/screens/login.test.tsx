import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import LoginScreen from '../../app/(auth)/login';
import { useSessionStore } from '../../app/shared/store/sessionStore';
import { register, _resetForTests } from '../../app/shared/mock/explorerRepository';

function resetSession() {
  useSessionStore.setState({
    explorerId: null,
    status: 'signed-out',
    onboardingCompletedAt: null,
  });
}

describe('Log in screen', () => {
  beforeEach(async () => {
    resetSession();
    await _resetForTests();
    await register({ displayName: 'Mai', email: 'mai@viego.app', password: 'secret6' });
  });

  it('signs in a returning Explorer and marks onboarding complete (skips Onboarding)', async () => {
    const { getByTestId, getByLabelText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'mai@viego.app');
    fireEvent.changeText(getByLabelText('Password'), 'secret6');
    fireEvent.press(getByTestId('login-submit'));

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('signed-in');
    });
    // Returning Explorer lands on main, not Onboarding.
    expect(useSessionStore.getState().onboardingCompletedAt).toBeTruthy();
  });

  it('shows an error banner and preserves the email on invalid credentials', async () => {
    const { getByTestId, getByLabelText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'mai@viego.app');
    fireEvent.changeText(getByLabelText('Password'), 'wrongpw');
    fireEvent.press(getByTestId('login-submit'));

    await waitFor(() => {
      expect(getByTestId('login-error')).toBeTruthy();
    });
    expect(getByLabelText('Email').props.value).toBe('mai@viego.app');
    expect(useSessionStore.getState().status).toBe('signed-out');
  });

  it('renders a link to Register', () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />);
    expect(getByTestId('login-register-link')).toBeTruthy();
  });

  it('renders Facebook and Zalo as disabled providers', () => {
    const { getByLabelText } = renderWithProviders(<LoginScreen />);
    expect(getByLabelText('Continue with Facebook').props.accessibilityState.disabled).toBe(true);
    expect(getByLabelText('Continue with Zalo').props.accessibilityState.disabled).toBe(true);
    expect(getByLabelText('Continue with Google').props.accessibilityState.disabled).toBeFalsy();
  });
});
