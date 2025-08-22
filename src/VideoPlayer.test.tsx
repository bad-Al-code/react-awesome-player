import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  it('renders the video player for a single source', () => {
    const videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    render(<VideoPlayer src={videoSrc} title="Test Video" />);

    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });
});
