import type { Level } from 'hls.js';
import type React from 'react';

type BasePlayerProps = {
  title?: string;
  subtitles?: {
    lang: string;
    label: string;
    src: string;
  }[];
  chapters?: {
    /** The time in seconds where the chapter marker should appear. */
    time: number;
    /** The title of the chapter, displayed in a tooltip. */
    label: string;
    thumbnail?: string;
  }[];

  /** An optional URL for a poster image to display before the video starts. */
  poster?: string;

  /**
   * If true, enables the theatre mode feature.
   * IMPORTANT: Requires a global CSS class `.theater-mode-active` to be styled in the parent application.
   * @default false
   */
  theaterModeEnabled?: boolean;
};

type SingleVideoPlayerProps = BasePlayerProps & {
  /** The URL of the single video source to play. */
  src: string;
  playlist?: never;
  currentVideoIndex?: never;
  onVideoChange?: never;
};

type PlaylistVideoPlayerProps = BasePlayerProps & {
  src?: never;
  /** An array of video source URLs to be played as a playlist. */
  playlist: string[];
  /** The index of the video in the playlist to start with. */
  currentVideoIndex: number;
  /** A callback function that is triggered when the video changes. */
  onVideoChange: (newIndex: number) => void;
};

/**
 * Props for the VideoPlayer component.
 * Can be configured for a single video source (`src`) or a playlist.
 */
export type VideoPlayerProps =
  | SingleVideoPlayerProps
  | PlaylistVideoPlayerProps;

export interface TimelineProps {
  progress: number;
  buffered: number;
  duration: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onHover: (positionX: number, timeFraction: number) => void;
  onMouseLeave: () => void;
  onSeekTo: (time: number) => void;
  chapters?: { time: number; label: string }[];
}

export type SettingsMenuType = 'main' | 'speed' | 'quality';

export interface SettingsMenuProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  availableQualities: Level[];
  currentQuality: number;
  onQualityChange: (levelIndex: number) => void;
  currentQualityLabel: string;
}

export interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  progress: number;
  buffered: number;
  duration: number;
  currentTime: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  toggleMute: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  toggleSettings: () => void;
  toggleSubtitles: () => void;
  areSubtitlesEnabled: boolean;
  toggleTheaterMode: () => void;
  isTheaterMode: boolean;
  toggleMiniPlayer: () => void;
  isVisible: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isAutoplayEnabled: boolean;
  toggleAutoplay: () => void;
  currentChapter?: string;
  onToggleChapters: () => void;
  areChaptersVisible: boolean;
}

export interface PlayerControlsWithTooltipProps extends PlayerControlsProps {
  isTooltipVisible: boolean;
  tooltipContent: string;
  tooltipPosition: number;
  onTimelineHover: (positionX: number, timeFraction: number) => void;
  onTimelineMouseLeave: () => void;
  chapters?: { time: number; label: string }[];
  onSeekTo: (time: number) => void;
  duration: number;
}
