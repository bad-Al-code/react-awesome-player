import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  it('renders the video player for a single source', () => {
    const videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    render(<VideoPlayer src={videoSrc} title="Test Video" />);

    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('renders a poster image when the poster prop is provided', () => {
    const videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    const posterSrc = 'https://example.com/poster.jpg';

    render(<VideoPlayer src={videoSrc} title="My Video" poster={posterSrc} />);

    const posterImage = screen.getByAltText('My Video');

    expect(posterImage).toBeInTheDocument();
    expect(posterImage).toHaveAttribute('src', posterSrc);
  });
});
