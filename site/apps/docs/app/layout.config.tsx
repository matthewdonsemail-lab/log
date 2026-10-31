import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { getSvgPath } from "figma-squircle";

// The header logo is a fixed 24px tile, so the squircle path is computed
// once (pure math — no measuring needed) and applied as a clipPath. Keeps
// the docs header on the dashboard's squircle-everywhere rule: the shape
// is a continuous-corner curve, never a plain border-radius.
const LOGO_SIZE = 24;
const LOGO_SQUIRCLE = `path('${getSvgPath({
  width: LOGO_SIZE,
  height: LOGO_SIZE,
  cornerRadius: 6,
  cornerSmoothing: 1,
})}')`;

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <img
          src="/logo.svg"
          alt="ListeningKit logo"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          className="size-6 shrink-0"
          style={{ clipPath: LOGO_SQUIRCLE }}
        />
        ListeningKit
      </>
    ),
  },
  links: [
    {
      text: "Dashboard",
      url: "http://localhost:3000",
      external: true,
    },
    {
      text: "Onboarding",
      url: "http://localhost:3000/onboarding",
      external: true,
    },
  ],
};