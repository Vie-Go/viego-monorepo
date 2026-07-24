import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import { ProfileScreen } from '../../app/screens/ProfileScreen';
import * as auth from '../../app/shared/api/auth';

jest.mock('../../app/shared/api/auth');
const mockedAuth = auth as jest.Mocked<typeof auth>;

const EXPLORER: auth.Explorer = {
  id: 'exp_1',
  handle: 'mai',
  displayName: 'mai',
  homeProvince: null,
  preferences: { language: 'vi', theme: 'light' },
};

describe('Profile screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the fetched Explorer preferences', async () => {
    mockedAuth.getMe.mockResolvedValue(EXPLORER);

    const { findByText } = renderWithProviders(<ProfileScreen />);

    expect(await findByText('Theme: light')).toBeTruthy();
    expect(await findByText('Language: vi')).toBeTruthy();
  });

  it('cycles the theme via the mutation and reflects the optimistic update', async () => {
    mockedAuth.getMe.mockResolvedValue(EXPLORER);
    mockedAuth.updatePreferences.mockResolvedValue({ language: 'vi', theme: 'dark' });

    const { findByText, getByText } = renderWithProviders(<ProfileScreen />);
    await findByText('Theme: light');

    fireEvent.press(getByText('Toggle theme'));

    await waitFor(() => {
      // TanStack Query's mutationFn is invoked with an internal second argument in this version —
      // assert only the variables our own mutationFn cares about, not the full call signature.
      expect(mockedAuth.updatePreferences.mock.calls[0]?.[0]).toEqual({ language: 'vi', theme: 'dark' });
    });
    expect(await findByText('Theme: dark')).toBeTruthy();
  });

  it('rolls back the optimistic update if the mutation fails', async () => {
    mockedAuth.getMe.mockResolvedValue(EXPLORER);
    mockedAuth.updatePreferences.mockRejectedValue(new Error('Request failed: 500'));

    const { findByText, getByText } = renderWithProviders(<ProfileScreen />);
    await findByText('Theme: light');

    fireEvent.press(getByText('Toggle theme'));

    await waitFor(() => {
      expect(mockedAuth.updatePreferences).toHaveBeenCalled();
    });
    expect(await findByText('Theme: light')).toBeTruthy();
  });
});
