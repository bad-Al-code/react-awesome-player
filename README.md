# React Awesome Player

[![npm version](https://img.shields.io/npm/v/react-awesome-player.svg?style=flat-square)](https://www.npmjs.com/package/react-awesome-player)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, feature-rich, and accessible video player for React, built with hls.js and Tailwind CSS. Designed to be simple to use and easy to integrate into any project.

## Features

- **HLS & MP4 Support:** Plays modern streaming formats (HLS) with a fallback to standard MP4.
- **Playlist Functionality:** Easily create and manage video playlists.
- **Adaptive Bitrate Streaming:** Automatically adjusts video quality based on network conditions.
- **Rich Controls:** Includes play/pause, volume, fullscreen, picture-in-picture, and settings menu.
- **Theatre Mode:** A beautiful, immersive viewing experience.
- **Keyboard Shortcuts:** Full keyboard navigation for power users.
- **Customizable:** Built with Tailwind CSS for easy theme customization.
- **Accessible:** Designed with accessibility in mind.

## Installation

```bash
pnpm add react-awesome-player
```

## Usage

Here's how to get started with a single video:

```tsx
import { VideoPlayer } from 'react-awesome-player';
import 'react-awesome-player/dist/style.css'; // Don't forget to import the styles!

function MyPage() {
  const videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const subtitles = [
    {
      lang: 'en',
      label: 'English',
      src: 'path/to/your/subtitles.vtt',
    },
  ];

  return (
    <div className="main-content-for-theater">
      <VideoPlayer
        src={videoSrc}
        title="My Awesome Video"
        subtitles={subtitles}
        theaterModeEnabled={true}
      />
    </div>
  );
}
```

#### Playlist Usage

```tsx
import { VideoPlayer } from 'react-awesome-player';
import 'react-awesome-player/dist/style.css';
import { useState } from 'react';

function PlaylistPage() {
  const myPlaylist = [
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="main-content-for-theater">
      <VideoPlayer
        playlist={myPlaylist}
        currentVideoIndex={currentIndex}
        onVideoChange={setCurrentIndex}
        title={`Video ${currentIndex + 1} of ${myPlaylist.length}`}
        theaterModeEnabled={true}
      />
    </div>
  );
}
```

### Theatre Mode Setup

For Theatre Mode to work correctly, you need to add a small piece of CSS to your global stylesheet. The player adds a class to the <body> tag, and this CSS tells your main content how to react.

In your global `styles.css`:

```css
body.theater-mode-active .main-content-for-theater {
  transition: margin-top 0.3s ease-in-out;
  margin-top: 56.25vw; /* Pushes content down by the height of a 16:9 video */
}
```

## API / Props

| Prop                 | Type                         | Required | Description                                                                                |
| -------------------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `src`                | `string`                     | Yes\*    | The URL of the single video source to play.                                                |
| `playlist`           | `string[]`                   | Yes\*    | An array of video source URLs for a playlist.                                              |
| `currentVideoIndex`  | `number`                     | Yes\*\*  | The starting index for the playlist.                                                       |
| `onVideoChange`      | `(newIndex: number) => void` | Yes\*\*  | Callback triggered when the video changes in a playlist.                                   |
| `title`              | `string`                     | No       | An optional title displayed at the top-left of the player.                                 |
| `subtitles`          | `Array`                      | No       | An array of subtitle track objects (`{ lang, label, src }`).                               |
| `theaterModeEnabled` | `boolean`                    | No       | If true, enables the theatre mode feature. Requires global CSS setup. Defaults to `false`. |

\*You must provide either `src` or `playlist`, but not both.
\*\*Required only when using the `playlist` prop.
