import React from 'react';
import { renderWithProviders } from '../testUtils';
import { Confetti } from '../../app/shared/ui/Confetti';

// jest.setup mocks useReducedMotion → false, so confetti renders under test.
describe('Confetti', () => {
  it('renders confetti pieces when motion is allowed', () => {
    const { getByTestId } = renderWithProviders(<Confetti testID="confetti" pieceCount={5} />);
    expect(getByTestId('confetti')).toBeTruthy();
  });
});
