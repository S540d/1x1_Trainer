import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LernreiseIntroModal } from './LernreiseIntroModal';
import { getThemeColors } from '../utils/theme';

const t = {
  lernreiseIntroTitle: 'Willkommen zu deiner Lernreise!',
  lernreiseIntroBody: 'Arbeite dich Malreihe für Malreihe von 1 bis 12 vor.',
  lernreiseIntroPracticeHint: 'Tipp: Nutze danach den Übungsmodus.',
  lernreiseIntroStart: "Los geht's!",
};

describe('LernreiseIntroModal', () => {
  const colors = getThemeColors(false);

  it('renders nothing meaningful when not visible', () => {
    const { queryByText } = render(
      <LernreiseIntroModal visible={false} onClose={jest.fn()} colors={colors} t={t} />
    );
    expect(queryByText(t.lernreiseIntroTitle)).toBeNull();
  });

  it('shows title, body and practice hint when visible', () => {
    const { getByText } = render(
      <LernreiseIntroModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    expect(getByText(t.lernreiseIntroTitle)).not.toBeNull();
    expect(getByText(t.lernreiseIntroBody)).not.toBeNull();
    expect(getByText(`💡 ${t.lernreiseIntroPracticeHint}`)).not.toBeNull();
  });

  it('calls onClose when the start button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <LernreiseIntroModal visible onClose={onClose} colors={colors} t={t} />
    );
    fireEvent.click(getByText(t.lernreiseIntroStart));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
