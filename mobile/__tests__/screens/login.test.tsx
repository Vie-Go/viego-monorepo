import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import LoginScreen from '../../app/(auth)/login';
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
    id: 'exp_1',
    handle: 'mai',
    displayName: 'mai',
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

describe('Log in screen', () => {
  beforeEach(() => {
    resetSession();
    jest.clearAllMocks();
    mockedTokenStore.setTokens.mockResolvedValue(undefined);
  });

  it('requests a code, then signs in with a valid code (skips Onboarding)', async () => {
    mockedAuth.requestEmailChallenge.mockResolvedValue(undefined);
    mockedAuth.signInWithEmailCode.mockResolvedValue(SESSION);

    const { getByTestId, getByLabelText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'mai@viego.app');
    fireEvent.press(getByTestId('login-submit'));

    await waitFor(() => expect(getByTestId('login-code-submit')).toBeTruthy());

    fireEvent.changeText(getByLabelText('Verification code'), '123456');
    fireEvent.press(getByTestId('login-code-submit'));

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('signed-in');
    });
    expect(useSessionStore.getState().onboardingCompletedAt).toBeTruthy();
    expect(mockedTokenStore.setTokens).toHaveBeenCalledWith('access.jwt', 'refresh.jwt');
    expect(mockedAuth.signInWithEmailCode).toHaveBeenCalledWith('mai@viego.app', '123456');
  });

  it('shows an invalid-code error, preserves the email, and stays signed out', async () => {
    mockedAuth.requestEmailChallenge.mockResolvedValue(undefined);
    mockedAuth.signInWithEmailCode.mockRejectedValue(new Error('Request failed: 400'));

    const { getByTestId, getByLabelText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'mai@viego.app');
    fireEvent.press(getByTestId('login-submit'));
    await waitFor(() => expect(getByTestId('login-code-submit')).toBeTruthy());

    fireEvent.changeText(getByLabelText('Verification code'), '000000');
    fireEvent.press(getByTestId('login-code-submit'));

    await waitFor(() => {
      expect(getByTestId('login-error')).toBeTruthy();
    });
    expect(useSessionStore.getState().status).toBe('signed-out');
  });

  it('shows a connectivity error distinct from an invalid code (FR-018)', async () => {
    mockedAuth.requestEmailChallenge.mockRejectedValue(new TypeError('Network request failed'));

    const { getByTestId, getByLabelText, getByText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'mai@viego.app');
    fireEvent.press(getByTestId('login-submit'));

    await waitFor(() => {
      expect(getByTestId('login-error')).toBeTruthy();
    });
    expect(getByText("Can't reach VieGo. Check your connection and try again.")).toBeTruthy();
  });

  it('renders a link to Register', () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />);
    expect(getByTestId('login-register-link')).toBeTruthy();
  });

  it('renders Facebook as a disabled provider, Google as enabled', () => {
    const { getByLabelText } = renderWithProviders(<LoginScreen />);
    expect(getByLabelText('Continue with Facebook').props.accessibilityState.disabled).toBe(true);
    expect(getByLabelText('Continue with Google').props.accessibilityState.disabled).toBeFalsy();
  });
});
