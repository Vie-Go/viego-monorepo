import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import { Input } from '../../app/shared/ui/Input';

describe('Input', () => {
  it('renders and accepts text via the accessible label', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <Input label="Email" placeholder="Email" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByLabelText('Email'), 'me@viego.app');
    expect(onChangeText).toHaveBeenCalledWith('me@viego.app');
  });

  it('shows an error message when provided', () => {
    const { getByText } = renderWithProviders(
      <Input label="Email" error="Enter a valid email address." />,
    );
    expect(getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('honours the disabled (non-editable) state', () => {
    const { getByLabelText } = renderWithProviders(
      <Input label="Email" editable={false} />,
    );
    expect(getByLabelText('Email').props.editable).toBe(false);
  });
});
