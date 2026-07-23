import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import { Button } from '../../app/shared/ui/Button';

describe('Button', () => {
  it('renders its label and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(<Button label="Continue" onPress={onPress} />);
    fireEvent.press(getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the button accessibility role', () => {
    const { getByRole } = renderWithProviders(<Button label="Log in" />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <Button label="Create account" onPress={onPress} disabled />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByRole('button').props.accessibilityState.disabled).toBe(true);
  });

  it('hides the label while loading', () => {
    const { queryByText } = renderWithProviders(<Button label="Log in" loading />);
    expect(queryByText('Log in')).toBeNull();
  });
});
