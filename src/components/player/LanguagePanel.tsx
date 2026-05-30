'use client';

/**
 * src/components/player/LanguagePanel.tsx
 *
 * Netflix-style floating language panel with two tabs:
 *  Audio  — 11 languages with flag + native name
 *  Subtitles — OFF + 10 languages + style customization section
 *
 * Opens from the PlayerControls bar (CC / audio badge buttons).
 * Positioned inside the player wrapper, respects fullscreen.
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Subtitles, Check, ChevronRight } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import {
  AUDIO_LANGUAGES,
  SUBTITLE_LANGUAGES,
  SubtitleStyle,
} from '@/lib/player-prefs';

// ─── Language row ─────────────────────────────────────────────────────────────
function LangRow({
  flag, label, native: nativeName, isActive, onClick,
}: {
  flag: string; label: string; native: string;
  isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
      style={{
        background: isActive ? 'rgba(0,82,255,0.14)' : 'transparent',
        borderLeft: isActive ? '2px solid #0052FF' : '2px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <span className="text-base flex-shrink-0">{flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate"
          style={{ fontFamily: '"DM Sans", sans-serif' }}>
          {label}
        </p>
        <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {nativeName}
        </p>
      </div>
      {isActive && <Check size={13} style={{ color: '#0052FF', flexShrink: 0 }} />}
    </button>
  );
}

// ─── Style option button ──────────────────────────────────────────────────────
function StyleOption({
  label, isActive, onClick,
}: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: isActive ? 'rgba(0,82,255,0.80)' : 'rgba(255,255,255,0.08)',
        color: '#fff',
        border: isActive ? '1px solid rgba(0,82,255,0)' : '1px solid rgba(255,255,255,0.10)',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {label}
    </button>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export function LanguagePanel() {
  const {
    panelOpen, panelTab, closePanel, openPanel,
    audioLang, setAudioLang,
    subtitleLang, subtitleEnabled,
    setSubtitleLang, setSubtitleEnabled,
    subtitleStyle, setSubtitleStyle,
  } = usePlayerStore();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    if (panelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen, closePanel]);

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div
          ref={panelRef}
          key="lang-panel"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute bottom-16 right-4 z-50 w-72 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background:    'rgba(10,10,14,0.97)',
            backdropFilter:'blur(24px)',
            border:        '1px solid rgba(255,255,255,0.10)',
            boxShadow:     '0 24px 60px rgba(0,0,0,0.85)',
            maxHeight:     '70vh',
            fontFamily:    '"DM Sans", system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex gap-1">
              {(['audio', 'subtitles'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => openPanel(tab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                  style={{
                    background: panelTab === tab ? 'rgba(255,255,255,0.10)' : 'transparent',
                    color:      panelTab === tab ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {tab === 'audio'
                    ? <Volume2 size={11} />
                    : <Subtitles size={11} />}
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={closePanel} className="text-gray-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Tab content */}
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            <AnimatePresence mode="wait">
              {panelTab === 'audio' ? (
                <motion.div
                  key="audio"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="py-2"
                >
                  <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.30)', fontFamily: '"Space Mono", monospace' }}>
                    Audio Language
                  </p>
                  {AUDIO_LANGUAGES.map(lang => (
                    <LangRow
                      key={lang.code}
                      flag={lang.flag}
                      label={lang.label}
                      native={lang.native}
                      isActive={audioLang === lang.code}
                      onClick={() => setAudioLang(lang.code)}
                    />
                  ))}
                  <div className="px-4 py-3">
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
                      Switching audio language reloads the player with the selected language track.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="subtitles"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="py-2"
                >
                  {/* OFF toggle */}
                  <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.30)', fontFamily: '"Space Mono", monospace' }}>
                    Subtitles
                  </p>
                  <button
                    onClick={() => setSubtitleEnabled(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{
                      background: !subtitleEnabled ? 'rgba(0,82,255,0.14)' : 'transparent',
                      borderLeft: !subtitleEnabled ? '2px solid #0052FF' : '2px solid transparent',
                    }}
                  >
                    <span className="text-base flex-shrink-0">🚫</span>
                    <span className="flex-1 text-sm font-medium text-white"
                      style={{ fontFamily: '"DM Sans", sans-serif' }}>
                      Off
                    </span>
                    {!subtitleEnabled && <Check size={13} style={{ color: '#0052FF' }} />}
                  </button>

                  {SUBTITLE_LANGUAGES.map(lang => (
                    <LangRow
                      key={lang.code}
                      flag={lang.flag}
                      label={lang.label}
                      native={lang.native}
                      isActive={subtitleEnabled && subtitleLang === lang.code}
                      onClick={() => setSubtitleLang(lang.code)}
                    />
                  ))}

                  {/* Style controls */}
                  <div
                    className="px-4 pt-3 pb-4 mt-2 space-y-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.30)', fontFamily: '"Space Mono", monospace' }}>
                      Subtitle Style
                    </p>

                    {/* Font size */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-1.5">Size</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(['small', 'medium', 'large', 'xl'] as SubtitleStyle['fontSize'][]).map(s => (
                          <StyleOption
                            key={s} label={s === 'xl' ? 'XL' : s.charAt(0).toUpperCase() + s.slice(1)}
                            isActive={subtitleStyle.fontSize === s}
                            onClick={() => setSubtitleStyle({ fontSize: s })}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Background */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-1.5">Background</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(['none', 'low', 'medium', 'high'] as SubtitleStyle['bgOpacity'][]).map(b => (
                          <StyleOption
                            key={b} label={b.charAt(0).toUpperCase() + b.slice(1)}
                            isActive={subtitleStyle.bgOpacity === b}
                            onClick={() => setSubtitleStyle({ bgOpacity: b })}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-1.5">Color</p>
                      <div className="flex gap-1.5">
                        <StyleOption label="White" isActive={subtitleStyle.color === 'white'}
                          onClick={() => setSubtitleStyle({ color: 'white' })} />
                        <StyleOption label="Yellow" isActive={subtitleStyle.color === 'yellow'}
                          onClick={() => setSubtitleStyle({ color: 'yellow' })} />
                      </div>
                    </div>

                    {/* Position */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-1.5">Position</p>
                      <div className="flex gap-1.5">
                        <StyleOption label="Bottom" isActive={subtitleStyle.position === 'bottom'}
                          onClick={() => setSubtitleStyle({ position: 'bottom' })} />
                        <StyleOption label="Top" isActive={subtitleStyle.position === 'top'}
                          onClick={() => setSubtitleStyle({ position: 'top' })} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
