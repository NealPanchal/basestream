'use client';

/**
 * src/store/playerStore.ts — Zustand store for player language preferences
 *
 * Single source of truth for:
 * - Audio language selection
 * - Subtitle language + enabled state
 * - Subtitle style customization
 * - Playback timer (for subtitle sync since we can't read iframe currentTime)
 *
 * All mutations auto-persist to localStorage via savePrefs().
 */

import { create } from 'zustand';
import {
  PlayerPrefs,
  SubtitleStyle,
  loadPrefs,
  savePrefs,
  DEFAULT_PREFS,
} from '@/lib/player-prefs';

interface PlayerState extends PlayerPrefs {
  // Playback timer (estimated position for subtitle sync)
  playbackMs:    number;
  isPlaying:     boolean;
  syncOffsetMs:  number;   // manual ±offset nudge in ms

  // Panel visibility
  panelOpen:     boolean;
  panelTab:      'audio' | 'subtitles';

  // Actions
  setAudioLang:        (lang: string) => void;
  setSubtitleLang:     (lang: string) => void;
  setSubtitleEnabled:  (v: boolean) => void;
  setSubtitleStyle:    (style: Partial<SubtitleStyle>) => void;
  setPlaybackMs:       (ms: number) => void;
  setIsPlaying:        (v: boolean) => void;
  nudgeSync:           (deltaMs: number) => void;
  openPanel:           (tab?: 'audio' | 'subtitles') => void;
  closePanel:          () => void;
  reset:               () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Load initial prefs from localStorage
  const initial = typeof window !== 'undefined' ? loadPrefs() : DEFAULT_PREFS;

  return {
    ...initial,
    playbackMs:   0,
    isPlaying:    false,
    syncOffsetMs: 0,
    panelOpen:    false,
    panelTab:     'audio',

    setAudioLang: (lang) => {
      set({ audioLang: lang });
      savePrefs({ audioLang: lang });
    },

    setSubtitleLang: (lang) => {
      set({ subtitleLang: lang, subtitleEnabled: lang !== 'off' });
      savePrefs({ subtitleLang: lang, subtitleEnabled: lang !== 'off' });
    },

    setSubtitleEnabled: (v) => {
      set({ subtitleEnabled: v });
      savePrefs({ subtitleEnabled: v });
    },

    setSubtitleStyle: (style) => {
      const next = { ...get().subtitleStyle, ...style };
      set({ subtitleStyle: next });
      savePrefs({ subtitleStyle: next });
    },

    setPlaybackMs:  (ms) => set({ playbackMs: ms }),
    setIsPlaying:   (v)  => set({ isPlaying: v }),

    nudgeSync: (deltaMs) =>
      set((s) => ({ syncOffsetMs: s.syncOffsetMs + deltaMs })),

    openPanel: (tab = 'audio') =>
      set({ panelOpen: true, panelTab: tab }),

    closePanel: () => set({ panelOpen: false }),

    reset: () => {
      set({ ...initial, playbackMs: 0, isPlaying: false, syncOffsetMs: 0, panelOpen: false });
    },
  };
});
