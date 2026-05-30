import { useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type SoundEvent = 'correct' | 'incorrect' | 'perfect' | 'level_up' | 'badge_unlock';

type NoteConfig = { freq: number; durationMs: number; amp?: number };

const SOUND_CONFIGS: Record<SoundEvent, NoteConfig[]> = {
  correct:      [{ freq: 880, durationMs: 80, amp: 0.50 }, { freq: 1319, durationMs: 110, amp: 0.42 }],
  incorrect:    [{ freq: 210, durationMs: 200, amp: 0.32 }],
  perfect:      [{ freq: 523, durationMs: 80 }, { freq: 659, durationMs: 80 }, { freq: 784, durationMs: 80 }, { freq: 1047, durationMs: 160, amp: 0.58 }],
  level_up:     [{ freq: 392, durationMs: 70, amp: 0.48 }, { freq: 494, durationMs: 70, amp: 0.48 }, { freq: 587, durationMs: 70, amp: 0.48 }, { freq: 784, durationMs: 130, amp: 0.55 }],
  badge_unlock: [{ freq: 1047, durationMs: 60, amp: 0.40 }, { freq: 1319, durationMs: 60, amp: 0.40 }, { freq: 1047, durationMs: 55, amp: 0.36 }, { freq: 1568, durationMs: 130, amp: 0.46 }],
};

function playWebTone(config: NoteConfig[], volume: number): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext || // platform-safe
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; // platform-safe
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    let t = ctx.currentTime;
    for (const note of config) {
      const dur = note.durationMs / 1000;
      const amp = (note.amp ?? 0.55) * (volume / 100);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.01);
      t += dur;
    }
    const delay = (t - ctx.currentTime) * 1000 + 300;
    setTimeout(() => { ctx.close().catch(() => {}); }, delay);
  } catch {
    /* ignore – autoplay policy or missing AudioContext */
  }
}

export function useSounds(soundEnabled: boolean, soundVolume: number) {
  const soundRefs = useRef<Partial<Record<SoundEvent, Audio.Sound>>>({});
  const enabledRef = useRef(soundEnabled);
  const volumeRef = useRef(soundVolume);

  useEffect(() => { enabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { volumeRef.current = soundVolume; }, [soundVolume]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;

    Audio.setAudioModeAsync({ playsInSilentModeIOS: false }).catch(() => {});

    const loadAll = async () => {
      const assets: [SoundEvent, number][] = [
        ['correct',      require('../assets/sounds/correct.wav') as number],
        ['incorrect',    require('../assets/sounds/incorrect.wav') as number],
        ['perfect',      require('../assets/sounds/perfect.wav') as number],
        ['level_up',     require('../assets/sounds/level_up.wav') as number],
        ['badge_unlock', require('../assets/sounds/badge_unlock.wav') as number],
      ];
      for (const [event, src] of assets) {
        if (cancelled) break;
        try {
          const { sound } = await Audio.Sound.createAsync(src, { shouldPlay: false });
          if (cancelled) {
            sound.unloadAsync().catch(() => {});
            break;
          }
          soundRefs.current[event] = sound;
        } catch {
          /* skip individual sound that fails to load */
        }
      }
    };
    loadAll();

    return () => {
      cancelled = true;
      const refs = soundRefs.current;
      soundRefs.current = {};
      for (const s of Object.values(refs)) {
        s?.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const playSound = useCallback((event: SoundEvent): void => {
    if (!enabledRef.current) return;
    const vol = volumeRef.current;

    if (Platform.OS === 'web') {
      playWebTone(SOUND_CONFIGS[event], vol);
      return;
    }

    const sound = soundRefs.current[event];
    if (!sound) return;
    sound
      .setVolumeAsync(vol / 100)
      .then(() => sound.replayAsync())
      .catch(() => {});
  }, []);

  return { playSound };
}
