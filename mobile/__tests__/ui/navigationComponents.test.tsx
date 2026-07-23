import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { Home, Map } from 'lucide-react-native';
import { renderWithProviders } from '../testUtils';
import { BackButton } from '../../app/shared/ui/navigation/BackButton';
import { ScreenHeader } from '../../app/shared/ui/navigation/ScreenHeader';
import { SegmentedControl } from '../../app/shared/ui/navigation/SegmentedControl';
import { BottomTabBar } from '../../app/shared/ui/navigation/BottomTabBar';
import { BottomSheet } from '../../app/shared/ui/navigation/BottomSheet';

describe('BackButton', () => {
  it('fires onPress with an accessible label', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(<BackButton onPress={onPress} />);
    fireEvent.press(getByLabelText('Go back'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ScreenHeader', () => {
  it('renders a header title', () => {
    const { getByText } = renderWithProviders(<ScreenHeader title="Search" />);
    expect(getByText('Search')).toBeTruthy();
  });
});

describe('SegmentedControl', () => {
  it('marks the active tab and switches on press', () => {
    const onChange = jest.fn();
    const { getByText } = renderWithProviders(
      <SegmentedControl segments={['Public', 'Friends']} value={0} onChange={onChange} />,
    );
    fireEvent.press(getByText('Friends'));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe('BottomTabBar', () => {
  it('renders tabs and fires selection + camera FAB', () => {
    const onSelect = jest.fn();
    const onCameraPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <BottomTabBar
        tabs={[
          { key: 'map', label: 'Map', icon: Map },
          { key: 'home', label: 'Home', icon: Home },
        ]}
        activeKey="map"
        onSelect={onSelect}
        onCameraPress={onCameraPress}
      />,
    );
    fireEvent.press(getByLabelText('Home'));
    expect(onSelect).toHaveBeenCalledWith('home');
    fireEvent.press(getByLabelText('Open camera'));
    expect(onCameraPress).toHaveBeenCalledTimes(1);
  });
});

describe('BottomSheet', () => {
  it('renders content when visible and closes via the backdrop', () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = renderWithProviders(
      <BottomSheet visible title="Hà Nội" onClose={onClose}>
        <Text>Sheet body</Text>
      </BottomSheet>,
    );
    expect(getByText('Sheet body')).toBeTruthy();
    fireEvent.press(getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = renderWithProviders(
      <BottomSheet visible={false} onClose={() => {}}>
        <Text>Sheet body</Text>
      </BottomSheet>,
    );
    expect(queryByText('Sheet body')).toBeNull();
  });
});
