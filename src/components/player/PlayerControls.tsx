'use client';

/**
 * src/components/player/PlayerControls.tsx
 *
 * Thin glassmorphism control bar shown at the bottom-left of the player.
 * Fades out on mouse idle (3s), reappears on mouse move.
 *
 * Controls:
 *  - Audio language badge (e.g. "🔊 EN") → opens Audio tab
 *  - CC button → opens Subtitles tab
 *  - Sync offset nudge (±5s) — shown when subtitles are enabled
 *  - Subtitle status indicator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Subtitles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { AUDIO_LANGUAGES } from '@/lib/player-prefs';
import type { SubtitleStatus } from '@/lib/subtitle-engine';

interface PlayerControlsProps {
  subtitleStatus: SubtitleStatus;
}

export function PlayerControls({ subtitleStatus }: PlayerControlsProps) {
  const {
    audioLang, subtitleEnabled, panelOpen,
    openPanel, nudgeSync,
  } = usePlayerStore();

  const [visible, setVisible]   = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const audioLabel = AUDIO_LANGUAGES.find(l => l.code === audioLang);

  const subtitleStatusColor: Record<SubtitleStatus, string> = {
    idle:        'rgba(255,255,255,0.35)',
    loading:     '#60a5fa',
    ready:       '#4ade80',
    'not-found': '#fb923c',
    error:       '#f87171',
  };

  const subtitleStatusLabel: Record<SubtitleStatus, string> = {
    idle:        '',
    loading:     'Loading…',
    ready:       'Subtitles ready',
    'not-found': 'No subtitles found',
    error:       'Subtitle error',
  };

  return (
    <AnimatePresence>
      {(visible || panelOpen) && (
        <motion.div
          key="controls"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-4 left-4 z-10 flex items-center gap-2"
        >
          {/* Audio language button */}
          <button
            onClick={() => openPanel('audio')}
            aria-label={`Audio: ${audioLabel?.label ?? audioLang}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background:    'rgba(0,0,0,0.65)',
              backdropFilter:'blur(12px)',
              border:        panelOpen ? '1px solid rgba(0,82,255,0.60)' : '1px solid rgba(255,255,255,0.12)',
              fontFamily:    '"DM Sans", sans-serif',
            }}
          >
            <Volume2 size={13} color={panelOpen ? '#0052FF' : 'rgba(255,255,255,0.75)'} />
            <span className="text-xs font-bold" style={{ color: '#fff' }}>
              {audioLabel?.flag ?? '🔊'} {audioLang.toUpperCase()}
            </span>
          </button>

          {/* CC / Subtitles button */}
          <button
            onClick={() => openPanel('subtitles')}
            aria-label="Subtitles"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background:    'rgba(0,0,0,0.65)',
              backdropFilter:'blur(12px)',
              border:        subtitleEnabled ? '1px solid rgba(0,82,255,0.60)' : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {subtitleStatus === 'loading' ? (
              <Loader2 size={13} color="#60a5fa" className="animate-spin" />
            ) : (
              <Subtitles size={13} color={subtitleEnabled ? '#0052FF' : 'rgba(255,255,255,0.75)'} />
            )}
            <span
              className="text-xs font-bold"
              style={{ color: subtitleEnabled ? '#0052FF' : 'rgba(255,255,255,0.75)' }}
            >
              CC
            </span>
          </button>

          {/* Sync nudge — only when subtitles are on and loaded */}
          {subtitleEnabled && subtitleStatus === 'ready' && (
            <div
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl"
              style={{
                background:    'rgba(0,0,0,0.65)',
                backdropFilter:'blur(12px)',
                border:        '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <button
                onClick={() => nudgeSync(-5000)}
                aria-label="Subtitle sync -5s"
                className="text-gray-300 hover:text-white transition-colors"
                title="-5s sync"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[10px] font-mono text-gray-400 select-none px-0.5">
                SYNC
              </span>
              <button
                onClick={() => nudgeSync(5000)}
                aria-label="Subtitle sync +5s"
                className="text-gray-300 hover:text-white transition-colors"
                title="+5s sync"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Subtitle status indicator */}
          {subtitleStatus !== 'idle' && subtitleStatus !== 'ready' && (
            <div
              className="px-2.5 py-1.5 rounded-xl"
              style={{
                background:    'rgba(0,0,0,0.65)',
                backdropFilter:'blur(12px)',
                border:        '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{ color: subtitleStatusColor[subtitleStatus], fontFamily: '"Space Mono", monospace' }}
              >
                {subtitleStatusLabel[subtitleStatus]}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
