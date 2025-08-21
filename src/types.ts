import type { Level } from "hls.js";
import type React from "react";

type BasePlayerProps = {
  /** An optional title for the video, displayed at the top-left of the player. */
  title?: string;
  /** An array of subtitle track objects to be added to the video. */
  subtitles?: {
    lang: string;
    label: string;
    src: string;
  }[];
  /** If true, enables the theatre mode feature for this player. */
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

export type VideoPlayerProps =
  | SingleVideoPlayerProps
  | PlaylistVideoPlayerProps;

export interface TimelineProps {
  progress: number;
  buffered: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onHover: (positionX: number, timeFraction: number) => void;
  onMouseLeave: () => void;
}

export type SettingsMenuType = "main" | "speed" | "quality";

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
}

export interface PlayerControlsWithTooltipProps extends PlayerControlsProps {
  isTooltipVisible: boolean;
  tooltipContent: string;
  tooltipPosition: number;
  onTimelineHover: (positionX: number, timeFraction: number) => void;
  onTimelineMouseLeave: () => void;
}
