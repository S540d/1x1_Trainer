import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { WelcomeScreen } from './WelcomeScreen';
import { getThemeColors } from '../utils/theme';

const t = {
  welcomeTitle: 'Was möchtest du machen?',
  welcomeLernreiseTitle: 'Zahlenreihen lernen',
  welcomeLernreiseBody: 'Meistere auf der Lernreise eine Malreihe nach der anderen.',
  welcomeRowPickTitle: 'Festige dein Können',
  welcomeRowPickBody: 'Übe schwierigere Aufgaben öfter als leichte Aufgaben.',
  welcomeChallengeTitle: 'Herausforderungsmodus',
  welcomeChallengeBody: 'Endlos-Modus: antworte bis zu 3 Fehlern, die Schwierigkeit steigt.',
  welcomeSettingsHint: 'Tipp: In den Einstellungen kannst du mehr einstellen.',
};

describe('WelcomeScreen', () => {
  it('renders all three mode tiles with title and body', () => {
    const colors = getThemeColors(false);
    const { getByText } = render(
      <WelcomeScreen
        colors={colors}
        onSelectLernreise={jest.fn()}
        onSelectRowPick={jest.fn()}
        onSelectChallenge={jest.fn()}
        t={t}
      />
    );

    expect(getByText(t.welcomeTitle)).toBeTruthy();
    expect(getByText(t.welcomeLernreiseTitle)).toBeTruthy();
    expect(getByText(t.welcomeRowPickTitle)).toBeTruthy();
    expect(getByText(t.welcomeChallengeTitle)).toBeTruthy();
    expect(getByText(t.welcomeSettingsHint)).toBeTruthy();
  });

  it('calls the matching handler when a tile is pressed', () => {
    const colors = getThemeColors(false);
    const onSelectLernreise = jest.fn();
    const onSelectRowPick = jest.fn();
    const onSelectChallenge = jest.fn();
    const { getByText } = render(
      <WelcomeScreen
        colors={colors}
        onSelectLernreise={onSelectLernreise}
        onSelectRowPick={onSelectRowPick}
        onSelectChallenge={onSelectChallenge}
        t={t}
      />
    );

    fireEvent.click(getByText(t.welcomeRowPickTitle));
    expect(onSelectRowPick).toHaveBeenCalledTimes(1);
    expect(onSelectLernreise).not.toHaveBeenCalled();
    expect(onSelectChallenge).not.toHaveBeenCalled();
  });
});
