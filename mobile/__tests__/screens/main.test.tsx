import React from 'react';
import { renderWithProviders } from '../testUtils';
import MainScreen from '../../app/main';

describe('Main placeholder screen', () => {
  it('renders themed confirmation content', () => {
    const { getByTestId, getByText } = renderWithProviders(<MainScreen />);
    expect(getByTestId('main-brand')).toBeTruthy();
    expect(getByText('You’re all set')).toBeTruthy();
  });
});
