/**
 * useModals Hook
 * Consolidates the app's overlay/modal visibility booleans into one
 * activeModal slot (Issue #357, Punkt 1).
 */

import { useState } from 'react';

export type ModalName =
  | 'about'
  | 'personalize'
  | 'parentDashboard'
  | 'badges'
  | 'profilePicker'
  | 'lernreise'
  | 'lernreiseIntro'
  | 'taskSettings'
  | 'onboarding'
  | 'streakWarning';

// Deliberately excludes the settings-menu slide panel (App.tsx's own
// `menuRendered` state): it can legitimately stay open behind several of
// these modals (opening parentDashboard, badges, lernreise or taskSettings
// does not hide the menu first, unlike personalize/about/profilePicker),
// so it isn't mutually exclusive with them and doesn't belong in this union.
export function useModals() {
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);
  // profilePicker can additionally be opened in "forced" (non-dismissible)
  // mode — e.g. at launch when multiple profiles exist and one must be
  // picked before continuing. Tracked alongside activeModal since it's a
  // display variant of the same modal, not a separate one.
  const [profilePickerForced, setProfilePickerForced] = useState(false);

  const isOpen = (name: ModalName): boolean => activeModal === name;

  const open = (name: ModalName): void => setActiveModal(name);

  const close = (name: ModalName): void => {
    setActiveModal((current) => (current === name ? null : current));
  };

  const openProfilePickerForced = (): void => {
    setProfilePickerForced(true);
    setActiveModal('profilePicker');
  };

  const closeProfilePicker = (): void => {
    setProfilePickerForced(false);
    setActiveModal((current) => (current === 'profilePicker' ? null : current));
  };

  return {
    activeModal,
    isOpen,
    open,
    close,
    profilePickerForced,
    openProfilePickerForced,
    closeProfilePicker,
  };
}
