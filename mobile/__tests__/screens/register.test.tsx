import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import RegisterScreen from '../../app/(auth)/register';
import { useSessionStore } from '../../app/shared/store/sessionStore';
import { register, _resetForTests } from '../../app/shared/mock/explorerRepository';

function resetSession() {
  useSessionStore.setState({
    explorerId: null,
    status: 'signed-out',
    onboardingCompletedAt: null,
  });
}

describe('Register screen', () => {
  beforeEach(async () => {
    resetSession();
    await _resetForTests();
  });

  it('shows validation errors when submitting an empty form', () => {
    const { getByTestId, getAllByText } = renderWithProviders(<RegisterScreen />);
    fireEvent.press(getByTestId('register-submit'));
    expect(getAllByText('This field is required.').length).toBeGreaterThanOrEqual(3);
    expect(useSessionStore.getState().status).toBe('signed-out');
  });

  it('shows the consent line', () => {
    const { getByText } = renderWithProviders(<RegisterScreen />);
    expect(
      getByText('By creating an account you agree to the Terms and Privacy Policy.'),
    ).toBeTruthy();
  });

  it('surfaces a duplicate-email error while preserving entered fields', async () => {
    await register({ displayName: 'Mai', email: 'mai@viego.app', password: 'secret6' });
    const { getByTestId, getByText, getByLabelText } = renderWithProviders(<RegisterScreen />);

    fireEvent.changeText(getByLabelText('Full name'), 'Mai Again');
    fireEvent.changeText(getByLabelText('Email'), 'mai@viego.app');
    fireEvent.changeText(getByLabelText('Password'), 'secret6');
    fireEvent.press(getByTestId('register-submit'));

    await waitFor(() => {
      expect(getByText('An account with this email already exists.')).toBeTruthy();
    });
    // Fields preserved (FR-023).
    expect(getByLabelText('Full name').props.value).toBe('Mai Again');
    expect(getByLabelText('Email').props.value).toBe('mai@viego.app');
    expect(useSessionStore.getState().status).toBe('signed-out');
  });

  it('creates a session on successful registration', async () => {
    const { getByTestId, getByLabelText } = renderWithProviders(<RegisterScreen />);
    fireEvent.changeText(getByLabelText('Full name'), 'Linh');
    fireEvent.changeText(getByLabelText('Email'), 'linh@viego.app');
    fireEvent.changeText(getByLabelText('Password'), 'secret6');
    fireEvent.press(getByTestId('register-submit'));

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('signed-in');
    });
    // Onboarding not yet completed → guard will show Onboarding.
    expect(useSessionStore.getState().onboardingCompletedAt).toBeNull();
  });
});
