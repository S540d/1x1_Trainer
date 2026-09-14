/**
 * ModalHost
 * Renders every app-level overlay driven by the useModals() slot, plus the
 * badge-unlock toast. Extracted from App.tsx (Issue #357, Punkt 1) — the
 * modals keep their exact previous wiring, App.tsx just no longer spells it out.
 */

import React from 'react';
import { PersonalizeModal } from './PersonalizeModal';
import { AboutModal } from './AboutModal';
import { ParentDashboard } from './ParentDashboard';
import { OnboardingModal } from './OnboardingModal';
import { BadgesModal } from './BadgesModal';
import { BadgeUnlockToast } from './BadgeUnlockToast';
import { ProfilePickerModal } from './ProfilePickerModal';
import { LernreiseModal } from './LernreiseModal';
import { LernreiseIntroModal } from './LernreiseIntroModal';
import { TaskSettingsModal } from './TaskSettingsModal';
import { StreakWarningModal } from './StreakWarningModal';
import { useModals } from '../hooks/useModals';
import { usePreferences } from '../hooks/usePreferences';
import { useGameLogic } from '../hooks/useGameLogic';
import { useBadges } from '../hooks/useBadges';
import { useTheme } from '../hooks/useTheme';
import { ChildProfile, ThemeColors } from '../types/game';
import { TranslationStrings } from '../i18n/translations';

interface ModalHostProps {
  modals: ReturnType<typeof useModals>;
  preferences: ReturnType<typeof usePreferences>;
  theme: ReturnType<typeof useTheme>;
  game: ReturnType<typeof useGameLogic>;
  badgeSystem: ReturnType<typeof useBadges>;
  colors: ThemeColors;
  t: TranslationStrings;
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  weakTaskCount: number;
  currentStreak: number;
  onSwitchProfile: (profile: ChildProfile) => void;
  onProfilesChange: (profiles: ChildProfile[]) => void;
  onOnboardingFinish: () => void;
  onLernreiseIntroClose: () => void;
}

export const ModalHost: React.FC<ModalHostProps> = ({
  modals,
  preferences,
  theme,
  game,
  badgeSystem,
  colors,
  t,
  profiles,
  activeProfile,
  weakTaskCount,
  currentStreak,
  onSwitchProfile,
  onProfilesChange,
  onOnboardingFinish,
  onLernreiseIntroClose,
}) => (
  <>
    <TaskSettingsModal
      visible={modals.isOpen('taskSettings')}
      onClose={() => modals.close('taskSettings')}
      colors={colors}
      difficultyMode={game.gameState.difficultyMode}
      selectedOperations={game.gameState.selectedOperations}
      numberRange={preferences.numberRange}
      weakTaskCount={weakTaskCount}
      onToggleOperation={game.toggleOperation}
      onChangeDifficultyMode={game.changeDifficultyMode}
      onSetNumberRange={preferences.setNumberRange}
      t={t}
    />

    <PersonalizeModal
      visible={modals.isOpen('personalize')}
      onClose={() => modals.close('personalize')}
      colors={colors}
      language={preferences.language}
      onLanguageChange={preferences.setLanguage}
      themeMode={theme.themeMode}
      onThemeModeChange={preferences.setThemeMode}
      themeName={preferences.themeName}
      onThemeNameChange={preferences.setThemeName}
      soundEnabled={preferences.soundEnabled}
      onSoundEnabledChange={preferences.setSoundEnabled}
      soundVolume={preferences.soundVolume}
      onSoundVolumeChange={preferences.setSoundVolume}
    />

    <AboutModal
      visible={modals.isOpen('about')}
      onClose={() => modals.close('about')}
      colors={colors}
      t={t}
    />

    <ParentDashboard
      visible={modals.isOpen('parentDashboard')}
      onClose={() => modals.close('parentDashboard')}
      colors={colors}
      profileId={activeProfile?.id}
      t={t}
    />

    <ProfilePickerModal
      visible={modals.isOpen('profilePicker')}
      dismissible={!modals.profilePickerForced}
      onClose={() => {
        if (!modals.profilePickerForced) modals.close('profilePicker');
      }}
      profiles={profiles}
      activeProfileId={activeProfile?.id}
      onSwitchProfile={onSwitchProfile}
      onProfilesChange={onProfilesChange}
      colors={colors}
      t={t}
    />

    <StreakWarningModal
      visible={modals.isOpen('streakWarning')}
      onClose={() => modals.close('streakWarning')}
      colors={colors}
      currentStreak={currentStreak}
      t={t}
    />

    <OnboardingModal
      visible={modals.isOpen('onboarding')}
      onFinish={onOnboardingFinish}
      colors={colors}
      t={t}
    />

    <BadgesModal
      visible={modals.isOpen('badges')}
      onClose={() => modals.close('badges')}
      colors={colors}
      badges={badgeSystem.badges}
      language={preferences.language}
      t={t}
    />

    <BadgeUnlockToast
      badgeIds={badgeSystem.newlyUnlocked}
      onDone={badgeSystem.clearNewlyUnlocked}
      badgeNewUnlockedLabel={t.badgeNewUnlocked}
    />

    <LernreiseModal
      visible={modals.isOpen('lernreise')}
      onClose={() => modals.close('lernreise')}
      onSelectRow={(row) => game.startLernreiseRound(row)}
      colors={colors}
      profileId={activeProfile?.id}
      t={t}
    />

    <LernreiseIntroModal
      visible={modals.isOpen('lernreiseIntro')}
      onClose={onLernreiseIntroClose}
      colors={colors}
      t={t}
    />
  </>
);
