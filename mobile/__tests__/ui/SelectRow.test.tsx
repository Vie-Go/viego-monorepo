import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import { SelectRow } from '../../app/shared/ui/SelectRow';

describe('SelectRow', () => {
  it('renders code, label and native subtitle with the radio role', () => {
    const { getByText, getByRole } = renderWithProviders(
      <SelectRow code="VI" label="Tiếng Việt" sublabel="Vietnamese" selected={false} onPress={() => {}} />,
    );
    expect(getByText('VI')).toBeTruthy();
    expect(getByText('Tiếng Việt')).toBeTruthy();
    expect(getByText('Vietnamese')).toBeTruthy();
    expect(getByRole('radio')).toBeTruthy();
  });

  it('reflects the selected state to assistive tech', () => {
    const { getByRole } = renderWithProviders(
      <SelectRow code="EN" label="English" selected onPress={() => {}} />,
    );
    expect(getByRole('radio').props.accessibilityState.selected).toBe(true);
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <SelectRow code="EN" label="English" selected={false} onPress={onPress} />,
    );
    fireEvent.press(getByRole('radio'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
