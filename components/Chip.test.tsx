import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Chip } from './Chip';
import { getThemeColors } from '../utils/theme';

describe('Chip', () => {
  it('uses theme-aware inactive colors in dark mode', () => {
    const colors = getThemeColors(true);
    const { getByText } = render(
      <Chip label="Dark" active={false} onPress={jest.fn()} colors={colors} />
    );

    const label = getByText('Dark');
    const button = label.closest('[role="button"]') ?? label.parentElement;

    expect(button).not.toBeNull();
    expect(window.getComputedStyle(button as Element).backgroundColor).toBe('rgb(30, 41, 59)'); // platform-safe
    expect(window.getComputedStyle(label).color).toBe('rgb(148, 163, 184)'); // platform-safe
  });

  it('keeps the active state contrast and remains clickable', () => {
    const colors = getThemeColors(true);
    const onPress = jest.fn();
    const { getByText } = render(<Chip label="System" active onPress={onPress} colors={colors} />);

    const label = getByText('System');
    const button = label.closest('[role="button"]') ?? label.parentElement;

    fireEvent.click(label);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button).not.toBeNull();
    expect(window.getComputedStyle(button as Element).backgroundColor).toBe('rgb(102, 126, 234)'); // platform-safe
    expect(window.getComputedStyle(label).color).toBe('rgb(255, 255, 255)'); // platform-safe
  });
});
