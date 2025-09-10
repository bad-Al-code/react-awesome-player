import type { Level } from 'hls.js';
import { create } from 'zustand';

interface PlayerState {
  isPlaying: boolean;
  progress: number;
  buffered: number;
  duration: number;
  currentTime: number;
  volume: number;
  lastVolume: number;
  isFullScreen: boolean;
  isSettingsOpen: boolean;
  playbackSpeed: number;
  areSubtitlesEnabled: boolean;
  areControlsVisible: boolean;
  availableQualities: Level[];
  currentQuality: number;
  isMiniPlayer: boolean;
  isAutoplayEnabled: boolean;
  hasStarted: boolean;
  isTheaterMode: boolean;
  isBuffering: boolean;
  error: string | null;
}

interface PlayerActions {
  setIsPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  setBuffered: (buffered: number) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setAreControlsVisible: (isVisible: boolean) => void;
  setAvailableQualities: (qualities: Level[]) => void;
  setCurrentQuality: (quality: number) => void;
  setIsMiniPlayer: (isMiniPlayer: boolean) => void;
  setHasStarted: (hasStarted: boolean) => void;
  setIsTheaterMode: (isTheaterMode: boolean) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  setError: (error: string | null) => void;

  setVolume: (newVolume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleAutoplay: () => void;
}

const initialState: PlayerState = {
  isPlaying: false,
  progress: 0,
  buffered: 0,
  duration: 0,
  currentTime: 0,
  volume: 0.9,
  lastVolume: 0.9,
  isFullScreen: false,
  isSettingsOpen: false,
  playbackSpeed: 1,
  areSubtitlesEnabled: false,
  areControlsVisible: true,
  availableQualities: [],
  currentQuality: -1,
  isMiniPlayer: false,
  isAutoplayEnabled: false,
  hasStarted: false,
  isTheaterMode: false,
  isBuffering: false,
  error: null,
};

export const usePlayerStore = create<PlayerState & PlayerActions>(
  (set, get) => ({
    ...initialState,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setProgress: (progress) => set({ progress }),
    setBuffered: (buffered) => set({ buffered }),
    setDuration: (duration) => set({ duration }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setIsFullScreen: (isFullScreen) => set({ isFullScreen }),
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setAreControlsVisible: (isVisible) =>
      set({ areControlsVisible: isVisible }),
    setAvailableQualities: (qualities) =>
      set({ availableQualities: qualities }),
    setCurrentQuality: (quality) => set({ currentQuality: quality }),
    setIsMiniPlayer: (isMiniPlayer) => set({ isMiniPlayer }),
    setHasStarted: (hasStarted) => set({ hasStarted }),
    setIsTheaterMode: (isTheaterMode) => set({ isTheaterMode }),
    setIsBuffering: (isBuffering) => set({ isBuffering }),
    setError: (error) => set({ error }),

    setVolume: (newVolume) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      set({ volume: clampedVolume });
    },

    setPlaybackSpeed: (speed) => {
      set({ playbackSpeed: speed, isSettingsOpen: false });
    },

    togglePlay: () => {
      if (!get().hasStarted) {
        set({ hasStarted: true });
      }
      set((state) => ({ isPlaying: !state.isPlaying }));
    },

    toggleMute: () => {
      const { volume, lastVolume } = get();
      if (volume > 0) {
        set({ volume: 0, lastVolume: volume });
      } else {
        set({ volume: lastVolume });
      }
    },

    toggleAutoplay: () => {
      set((state) => ({ isAutoplayEnabled: !state.isAutoplayEnabled }));
    },
  }),
);

export const resetPlayerState = () => {
  usePlayerStore.setState(initialState);
};
