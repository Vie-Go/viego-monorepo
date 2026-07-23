import React from 'react';
import { fireEvent, renderWithProviders } from '../testUtils';
import MainScreen from '../../app/main';
import { useSessionStore } from '../../app/shared/store/sessionStore';
import { useLanguageStore } from '../../app/shared/store/languageStore';

beforeEach(() => {
  useSessionStore.setState({
    explorerId: 'e1',
    status: 'signed-in',
    onboardingCompletedAt: new Date().toISOString(),
  });
  useLanguageStore.setState({ code: 'en', source: 'explicit', hasChosen: true });
});

describe('Main placeholder screen', () => {
  it('renders themed confirmation content', () => {
    const { getByTestId, getByText } = renderWithProviders(<MainScreen />);
    expect(getByTestId('main-brand')).toBeTruthy();
    expect(getByText('You’re all set')).toBeTruthy();
  });

  it('restart flow button clears session and language state so the guard sends the Explorer back to Language Select', () => {
    const { getByTestId } = renderWithProviders(<MainScreen />);
    fireEvent.press(getByTestId('main-restart-flow'));

    expect(useSessionStore.getState().status).toBe('signed-out');
    expect(useSessionStore.getState().onboardingCompletedAt).toBeNull();
    expect(useLanguageStore.getState().hasChosen).toBe(false);
  });
});
