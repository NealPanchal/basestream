/**
 * src/lib/player-prefs.ts — Language constants + localStorage preference helpers
 *
 * Audio language switching works by rebuilding the iframe embed URL with
 * the selected language code as a URL param (e.g. ?lang=hi).
 *
 * Subtitles are fetched from OpenSubtitles and rendered as a custom HTML
 * overlay on top of the cross-origin iframe.
 */

// ─── Language definitions ─────────────────────────────────────────────────────

export interface Language {
  code: string;       // ISO 639-1
  label: string;      // English name
  native: string;     // Name in the native language
  flag: string;       // Flag emoji
  osCode: string;     // OpenSubtitles language code
}

export const AUDIO_LANGUAGES: Language[] = [
  { code: 'en', label: 'English',    native: 'English',    flag: '🇺🇸', osCode: 'en' },
  { code: 'hi', label: 'Hindi',      native: 'हिंदी',       flag: '🇮🇳', osCode: 'hi' },
  { code: 'ja', label: 'Japanese',   native: '日本語',       flag: '🇯🇵', osCode: 'ja' },
  { code: 'ko', label: 'Korean',     native: '한국어',       flag: '🇰🇷', osCode: 'ko' },
  { code: 'es', label: 'Spanish',    native: 'Español',    flag: '🇪🇸', osCode: 'es' },
  { code: 'fr', label: 'French',     native: 'Français',   flag: '🇫🇷', osCode: 'fr' },
  { code: 'de', label: 'German',     native: 'Deutsch',    flag: '🇩🇪', osCode: 'de' },
  { code: 'ta', label: 'Tamil',      native: 'தமிழ்',       flag: '🇮🇳', osCode: 'ta' },
  { code: 'te', label: 'Telugu',     native: 'తెలుగు',     flag: '🇮🇳', osCode: 'te' },
  { code: 'ar', label: 'Arabic',     native: 'العربية',    flag: '🇸🇦', osCode: 'ar' },
  { code: 'pt', label: 'Portuguese', native: 'Português',  flag: '🇧🇷', osCode: 'pt' },
];

export const SUBTITLE_LANGUAGES: Language[] = [
  { code: 'en',    label: 'English',    native: 'English',    flag: '🇺🇸', osCode: 'en' },
  { code: 'en-cc', label: 'English CC', native: 'English CC', flag: '🇺🇸', osCode: 'en' },
  { code: 'hi',    label: 'Hindi',      native: 'हिंदी',       flag: '🇮🇳', osCode: 'hi' },
  { code: 'ja',    label: 'Japanese',   native: '日本語',       flag: '🇯🇵', osCode: 'ja' },
  { code: 'es',    label: 'Spanish',    native: 'Español',    flag: '🇪🇸', osCode: 'es' },
  { code: 'fr',    label: 'French',     native: 'Français',   flag: '🇫🇷', osCode: 'fr' },
  { code: 'ar',    label: 'Arabic',     native: 'العربية',    flag: '🇸🇦', osCode: 'ar' },
  { code: 'ko',    label: 'Korean',     native: '한국어',       flag: '🇰🇷', osCode: 'ko' },
  { code: 'de',    label: 'German',     native: 'Deutsch',    flag: '🇩🇪', osCode: 'de' },
  { code: 'pt',    label: 'Portuguese', native: 'Português',  flag: '🇧🇷', osCode: 'pt' },
];

// ─── Subtitle style ───────────────────────────────────────────────────────────

export interface SubtitleStyle {
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  bgOpacity: 'none' | 'low' | 'medium' | 'high';
  color: 'white' | 'yellow';
  position: 'bottom' | 'top';
}

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
  fontSize:  'medium',
  bgOpacity: 'medium',
  color:     'white',
  position:  'bottom',
};

export const FONT_SIZE_MAP: Record<SubtitleStyle['fontSize'], string> = {
  small:  '14px',
  medium: '18px',
  large:  '22px',
  xl:     '28px',
};

export const BG_OPACITY_MAP: Record<SubtitleStyle['bgOpacity'], string> = {
  none:   'rgba(0,0,0,0)',
  low:    'rgba(0,0,0,0.45)',
  medium: 'rgba(0,0,0,0.72)',
  high:   'rgba(0,0,0,0.92)',
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_KEY = 'bs_player_prefs';

export interface PlayerPrefs {
  audioLang:       string;
  subtitleLang:    string;
  subtitleEnabled: boolean;
  subtitleStyle:   SubtitleStyle;
}

export const DEFAULT_PREFS: PlayerPrefs = {
  audioLang:       'en',
  subtitleLang:    'en',
  subtitleEnabled: false,
  subtitleStyle:   DEFAULT_SUBTITLE_STYLE,
};

export function loadPrefs(): PlayerPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return detectBrowserLanguage();
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Partial<PlayerPrefs>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadPrefs();
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch {
    // quota exceeded — ignore
  }
}

/** Detect browser language and map to a supported audio language code */
function detectBrowserLanguage(): PlayerPrefs {
  const browserLang = (typeof navigator !== 'undefined' ? navigator.language : 'en')
    .toLowerCase()
    .slice(0, 2);
  const supported = AUDIO_LANGUAGES.map(l => l.code);
  const audioLang = supported.includes(browserLang) ? browserLang : 'en';
  return { ...DEFAULT_PREFS, audioLang };
}

// ─── Embed URL builder ────────────────────────────────────────────────────────

export function buildMovieEmbedUrl(movieId: number, audioLang = 'en'): string {
  const params = new URLSearchParams({
    autoPlay: 'true',
    color:    '0052FF',
    lang:     audioLang,
  });
  return `https://www.vidking.net/embed/movie/${movieId}?${params}`;
}

export function buildTVEmbedUrl(
  tvId: number,
  season: number,
  episode: number,
  audioLang = 'en',
): string {
  const params = new URLSearchParams({
    autoPlay: 'true',
    color:    '0052FF',
    lang:     audioLang,
  });
  return `https://www.vidking.net/embed/tv/${tvId}/${season}/${episode}?${params}`;
}
