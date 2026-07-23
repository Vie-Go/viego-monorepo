import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import LanguageScreen from '../../app/(auth)/language';
import { useLanguageStore } from '../../app/shared/store/languageStore';

function resetLanguageStore() {
  useLanguageStore.setState({ code: null, source: 'device', hasChosen: false });
}

describe('Language Select screen', () => {
  beforeEach(() => resetLanguageStore());

  it('lists all five selectable locales', () => {
    const { getByTestId } = renderWithProviders(<LanguageScreen />);
    ['vi', 'en', 'ko', 'ja', 'fr'].forEach((code) => {
      expect(getByTestId(`lang-row-${code}`)).toBeTruthy();
    });
  });

  it('pre-selects a locale on first render (device fallback → English)', async () => {
    const { getByTestId } = renderWithProviders(<LanguageScreen />);
    await waitFor(() => {
      expect(getByTestId('lang-row-en').props.accessibilityState.selected).toBe(true);
    });
  });

  it('previews the picked language without confirming (guard stays put)', () => {
    const { getByTestId } = renderWithProviders(<LanguageScreen />);
    fireEvent.press(getByTestId('lang-row-vi'));
    expect(getByTestId('lang-row-vi').props.accessibilityState.selected).toBe(true);
    expect(useLanguageStore.getState().code).toBe('vi');
    expect(useLanguageStore.getState().hasChosen).toBe(false);
  });

  it('confirms + persists the choice on Continue', () => {
    const { getByTestId } = renderWithProviders(<LanguageScreen />);
    fireEvent.press(getByTestId('lang-row-vi'));
    fireEvent.press(getByTestId('lang-continue'));
    const state = useLanguageStore.getState();
    expect(state.code).toBe('vi');
    expect(state.hasChosen).toBe(true);
    expect(state.source).toBe('explicit');
  });
});
