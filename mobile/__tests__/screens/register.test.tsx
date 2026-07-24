import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import RegisterScreen from '../../app/(auth)/register';
import { useSessionStore } from '../../app/shared/store/sessionStore';
import * as auth from '../../app/shared/api/auth';
import * as authTokenStore from '../../app/shared/api/authTokenStore';

jest.mock('../../app/shared/api/auth');
jest.mock('../../app/shared/api/authTokenStore');
jest.mock('../../app/shared/api/useGoogleSignIn', () => ({
  useGoogleSignIn: () => ({ ready: false, promptAsync: jest.fn() }),
}));

const mockedAuth = auth as jest.Mocked<typeof auth>;
const mockedTokenStore = authTokenStore as jest.Mocked<typeof authTokenStore>;

const SESSION: auth.Session = {
  accessToken: 'access.jwt',
  refreshToken: 'refresh.jwt',
  explorer: {
    id: 'exp_2',
    handle: 'linh',
    displayName: 'linh',
    homeProvince: null,
    preferences: { language: 'vi', theme: 'light' },
  },
};

function resetSession() {
  useSessionStore.setState({
    explorerId: null,
    status: 'signed-out',
    onboardingCompletedAt: null,
  });
}

describe('Register screen', () => {
  beforeEach(() => {
    resetSession();
    jest.clearAllMocks();
    mockedTokenStore.setTokens.mockResolvedValue(undefined);
  });

  it('shows a validation error when submitting an empty email', () => {
    const { getByTestId, getByText } = renderWithProviders(<RegisterScreen />);
    fireEvent.press(getByTestId('register-submit'));
    expect(getByText('This field is required.')).toBeTruthy();
    expect(useSessionStore.getState().status).toBe('signed-out');
  });

  it('shows the consent line', () => {
    const { getByText } = renderWithProviders(<RegisterScreen />);
    expect(
      getByText('By creating an account you agree to the Terms and Privacy Policy.'),
    ).toBeTruthy();
  });

  it('requests a code, then signs in with a valid code and lands in Onboarding', async () => {
    mockedAuth.requestEmailChallenge.mockResolvedValue(undefined);
    mockedAuth.signInWithEmailCode.mockResolvedValue(SESSION);

    const { getByTestId, getByLabelText } = renderWithProviders(<RegisterScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'linh@viego.app');
    fireEvent.press(getByTestId('register-submit'));

    await waitFor(() => expect(getByTestId('register-code-submit')).toBeTruthy());

    fireEvent.changeText(getByLabelText('Verification code'), '654321');
    fireEvent.press(getByTestId('register-code-submit'));

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('signed-in');
    });
    // Onboarding not yet completed → guard will show Onboarding.
    expect(useSessionStore.getState().onboardingCompletedAt).toBeNull();
    expect(mockedTokenStore.setTokens).toHaveBeenCalledWith('access.jwt', 'refresh.jwt');
  });

  it('shows a connectivity error distinct from an invalid code (FR-018)', async () => {
    mockedAuth.requestEmailChallenge.mockRejectedValue(new TypeError('Network request failed'));

    const { getByTestId, getByLabelText, getByText } = renderWithProviders(<RegisterScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'linh@viego.app');
    fireEvent.press(getByTestId('register-submit'));

    await waitFor(() => {
      expect(getByTestId('register-error')).toBeTruthy();
    });
    expect(getByText("Can't reach VieGo. Check your connection and try again.")).toBeTruthy();
  });
});
