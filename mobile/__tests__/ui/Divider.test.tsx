import React from 'react';
import { renderWithProviders } from '../testUtils';
import { Divider } from '../../app/shared/ui/Divider';

describe('Divider', () => {
  it('renders a plain rule with no label', () => {
    const { queryByText, toJSON } = renderWithProviders(<Divider />);
    expect(queryByText(/./)).toBeNull();
    expect(toJSON()).toBeTruthy();
  });

  it('renders a centered label between two rules', () => {
    const { getByText } = renderWithProviders(<Divider label="or continue with" />);
    expect(getByText('or continue with')).toBeTruthy();
  });
});
