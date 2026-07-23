import React from 'react';
import { Text } from 'react-native';
import { renderWithProviders } from '../testUtils';
import { Card } from '../../app/shared/ui/Card';
import { StatTile } from '../../app/shared/ui/StatTile';
import { StreakBadge } from '../../app/shared/ui/StreakBadge';
import { Avatar } from '../../app/shared/ui/Avatar';

describe('Card', () => {
  it('renders its children', () => {
    const { getByText } = renderWithProviders(
      <Card>
        <Text>Inside card</Text>
      </Card>,
    );
    expect(getByText('Inside card')).toBeTruthy();
  });
});

describe('StatTile', () => {
  it('renders value + label with an accessible summary', () => {
    const { getByText, getByLabelText } = renderWithProviders(
      <StatTile value={6} label="day streak" />,
    );
    expect(getByText('6')).toBeTruthy();
    expect(getByText('day streak')).toBeTruthy();
    expect(getByLabelText('6 day streak')).toBeTruthy();
  });
});

describe('StreakBadge', () => {
  it('labels the active streak count', () => {
    const { getByLabelText } = renderWithProviders(<StreakBadge count={6} />);
    expect(getByLabelText('6 day streak')).toBeTruthy();
  });

  it('marks a broken streak for assistive tech', () => {
    const { getByLabelText } = renderWithProviders(<StreakBadge count={0} broken />);
    expect(getByLabelText('0 day streak, broken')).toBeTruthy();
  });
});

describe('Avatar', () => {
  it('falls back to the first initial when no image is given', () => {
    const { getByText, getByLabelText } = renderWithProviders(<Avatar name="Mai" />);
    expect(getByText('M')).toBeTruthy();
    expect(getByLabelText('Mai')).toBeTruthy();
  });
});
