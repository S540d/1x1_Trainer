/**
 * useProfileData Hook
 * Owns the child-profile list plus everything loaded per profile: task
 * statistics, streak data and today's completed rounds. Extracted from
 * App.tsx (Issue #357, Punkt 1) — same loads, same order, same triggers.
 */

import { useEffect, useRef, useState } from 'react';
import {
  getLocalDateString,
  getProfiles,
  getSessionRecords,
  getStreakData,
  getTaskStats,
  getYesterdayDateString,
  migrateToProfiles,
  setActiveProfileId,
} from '../utils/storage';
import { ChildProfile, StreakData, TaskStat } from '../types/game';

interface UseProfileDataParams {
  /** Called at launch when more than one profile exists and one must be picked. */
  onMultipleProfilesFound: () => void;
  /** Called when a still-savable streak has not been played today (evening only). */
  onStreakAtRisk: () => void;
}

export function useProfileData({ onMultipleProfilesFound, onStreakAtRisk }: UseProfileDataParams) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStat[]>([]);
  const [roundsToday, setRoundsToday] = useState(0);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastPlayedDate: '',
    longestStreak: 0,
  });

  // Ref so callbacks always see the current profileId without stale closures
  const activeProfileIdRef = useRef<string | undefined>(undefined);
  activeProfileIdRef.current = activeProfile?.id;

  // Migrate global storage → profile-keyed storage on first launch; idempotent after that
  useEffect(() => {
    migrateToProfiles().then(async (defaultProfile) => {
      const allProfiles = await getProfiles();
      setProfiles(allProfiles);
      setActiveProfile(defaultProfile);
      if (allProfiles.length > 1) {
        onMultipleProfilesFound();
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeProfile) return;
    getTaskStats(activeProfile.id).then(setTaskStats);
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load streak data and show warning when appropriate
  useEffect(() => {
    if (!activeProfile) return;
    getStreakData(activeProfile.id).then((data) => {
      setStreakData(data);
      const now = new Date();
      const isEvening = now.getHours() >= 20;
      // Warn only while the streak is actually still savable: last play was
      // exactly yesterday. For older dates the streak is already broken and
      // the warning would promise something the user can no longer save (#255).
      const streakStillSavable =
        data.currentStreak > 0 && data.lastPlayedDate === getYesterdayDateString();
      if (isEvening && streakStillSavable) {
        onStreakAtRisk();
      }
    });
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load today's completed rounds count (replaces the streak flame badge in the header)
  useEffect(() => {
    if (!activeProfile) return;
    const today = getLocalDateString();
    getSessionRecords(activeProfile.id).then((records) => {
      const count = records.filter(
        (r) => getLocalDateString(new Date(r.timestamp)) === today
      ).length;
      setRoundsToday(count);
    });
  }, [activeProfile?.id]);

  /** Make `profile` the active one and persist the choice. */
  const switchProfile = async (profile: ChildProfile) => {
    setActiveProfile(profile);
    await setActiveProfileId(profile.id);
  };

  /** Adopt an edited profile list; falls back to the first entry if the active one was deleted. */
  const applyProfilesChange = (updated: ChildProfile[]) => {
    setProfiles(updated);
    if (activeProfile && !updated.find((p) => p.id === activeProfile.id) && updated.length > 0) {
      setActiveProfile(updated[0]);
      setActiveProfileId(updated[0].id);
    }
  };

  return {
    profiles,
    setProfiles,
    activeProfile,
    setActiveProfile,
    switchProfile,
    applyProfilesChange,
    activeProfileIdRef,
    taskStats,
    setTaskStats,
    streakData,
    setStreakData,
    roundsToday,
    setRoundsToday,
  };
}
