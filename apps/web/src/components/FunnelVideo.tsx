import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';

type FunnelVideoProps = {
  src: string;
  title?: string;
  variant?: 'autoplay' | 'controls';
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
};

// VidStack 1.x MediaPlayer with the default video layout (it replaced the 0.6 community skin when the
// landing page's repo modal moved to the gg page's player). Blue brand accents.
export function FunnelVideo({
  src,
  title,
  variant = 'controls',
  autoPlay = false,
  muted = false,
  loop = false,
  className = '',
}: FunnelVideoProps) {
  if (variant === 'autoplay') {
    return (
      <MediaPlayer
        className={`block size-full ${className}`}
        title={title}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        load="eager"
        style={{ '--video-brand': '#2a8cff' }}
      >
        <MediaProvider />
      </MediaPlayer>
    );
  }

  return (
    <MediaPlayer
      className={`block size-full ${className}`}
      title={title}
      src={src}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline
      load="visible"
      style={{ '--video-brand': '#2a8cff' }}
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
