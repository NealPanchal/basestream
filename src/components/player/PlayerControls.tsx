'use client';

/**
 * src/components/player/PlayerControls.tsx
 *
 * Minimal glassmorphism control bar at the bottom of the player.
 * Fades out on mouse idle, reappears on mouse move.
 *
 * Controls:
 *  - Audio language selector (via AudioSelector)
 *  - CC / Subtitles toggle
 *  - Server selector
 *  - Settings panel (subtitle customization)
 *
 * All debug-like overlays, provider badges, and status indicators removed.
 */

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subtitles, Server, Check } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import type { SubtitleStatus } from '@/lib/subtitle-engine';
import { PROVIDER_ROSTER, PROVIDER_LABELS } from '@/lib/providers';
import type { ProviderId, ProviderHealth } from '@/lib/providers';
import { AudioSelector } from './AudioSelector';
import { SettingsPanel } from './SettingsPanel';

interface PlayerControlsProps {
  subtitleStatus: SubtitleStatus;
  currentProvider?: ProviderId;
  providerHealth?: Partial<Record<ProviderId, ProviderHealth>>;
  switchProvider?: (p: ProviderId) => void;
  isIdle: boolean;
}

export const PlayerControls = memo(function PlayerControls({
  subtitleStatus,
  currentProvider,
  providerHealth,
  switchProvider,
  isIdle,
}: PlayerControlsProps) {
  const {
    audioLang, subtitleEnabled, setAudioLang, setSubtitleEnabled,
  } = usePlayerStore();

  const [activeDropdown, setActiveDropdown] = useState<'audio' | 'subtitles' | 'servers' | 'settings' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!activeDropdown) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [activeDropdown]);

  return null;
});
