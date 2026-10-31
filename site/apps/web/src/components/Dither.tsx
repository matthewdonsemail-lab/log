import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import type { DitherProps } from './DitherCanvas';

export type { DitherProps };

/**
 * The dithered wave backgrounds use three.js (about 730 KB) and a WebGL context each. They are decoration, so:
 *  - the heavy canvas code loads after the page has painted, not inside the main bundle, and
 *  - each canvas is only created once it is near the screen. The landing page has 12 of them, most far down the page;
 *    creating all 12 at load blocked the main thread for over a second.
 * Until a canvas exists, an empty box of the same size (100% by 100%, like the canvas's own wrapper) holds its place, so
 * nothing shifts when it appears. Every place that uses this is a backdrop behind other content.
 */
const DitherCanvas = lazy(() => import('./DitherCanvas'));

/** Create the canvas this far before it scrolls into view, so it is drawn by the time it can be seen. */
const CREATE_MARGIN = '600px';

export default function Dither(props: DitherProps) {
  const holder = useRef<HTMLDivElement>(null);
  // Without IntersectionObserver (very old browsers) there is nothing to wait for: create it straight away.
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = holder.current;
    if (near || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: CREATE_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  return (
    <div ref={holder} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {near ? (
        <Suspense fallback={null}>
          <DitherCanvas {...props} />
        </Suspense>
      ) : null}
    </div>
  );
}
