import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import { Chip } from '../../app/shared/ui/Chip';
import { Toggle } from '../../app/shared/ui/Toggle';
import { ListRow, SpotRow } from '../../app/shared/ui/ListRow';

describe('Chip', () => {
  it('reflects selection and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText, rerender } = renderWithProviders(
      <Chip label="Food" selected={false} onPress={onPress} />,
    );
    fireEvent.press(getByText('Food'));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<Chip label="Food" selected onPress={onPress} />);
    expect(getByText('Food')).toBeTruthy();
  });
});

describe('Toggle', () => {
  it('exposes the switch role/state and toggles', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithProviders(
      <Toggle value={false} onValueChange={onValueChange} accessibilityLabel="Dark mode" />,
    );
    const sw = getByRole('switch');
    expect(sw.props.accessibilityState.checked).toBe(false);
    fireEvent.press(sw);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithProviders(
      <Toggle value={false} onValueChange={onValueChange} disabled accessibilityLabel="Dark mode" />,
    );
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('ListRow', () => {
  it('renders label + sublabel and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = renderWithProviders(
      <ListRow label="Language" sublabel="English" value="EN" onPress={onPress} />,
    );
    expect(getByText('Language')).toBeTruthy();
    fireEvent.press(getByLabelText('Language, English'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the SpotRow variant', () => {
    const { getByText } = renderWithProviders(<SpotRow title="Hồ Gươm" subtitle="Hà Nội" />);
    expect(getByText('Hồ Gươm')).toBeTruthy();
    expect(getByText('Hà Nội')).toBeTruthy();
  });
});
