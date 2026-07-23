import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Eye } from 'lucide-react-native';
import { renderWithProviders } from '../testUtils';
import { IconButton } from '../../app/shared/ui/IconButton';

describe('IconButton', () => {
  it('fires onPress and exposes its accessibility label', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <IconButton icon={Eye} accessibilityLabel="Show password" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Show password'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <IconButton icon={Eye} accessibilityLabel="Skip" onPress={onPress} disabled />,
    );
    fireEvent.press(getByLabelText('Skip'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
