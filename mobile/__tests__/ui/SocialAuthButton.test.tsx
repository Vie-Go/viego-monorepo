import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../testUtils';
import { SocialAuthButton } from '../../app/shared/ui/SocialAuthButton';

describe('SocialAuthButton', () => {
  it('labels the provider for assistive tech and fires onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <SocialAuthButton provider="google" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Continue with Google'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a disabled state for not-yet-wired providers', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <SocialAuthButton provider="facebook" onPress={onPress} disabled />,
    );
    const btn = getByLabelText('Continue with Facebook');
    expect(btn.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
  });
});
