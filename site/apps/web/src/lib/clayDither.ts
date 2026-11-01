import type { Material, MeshStandardMaterial } from "three"

/**
 * Two-colour ordered dither compiled into a material, ported from rank
 * (rank/apps/web/src/components/ui/ClayDither.ts + DitheringPass.tsx BAYER_GLSL,
 * MIT, ListeningKit). The object draws its own halftone after tone mapping, so
 * the surrounding scene stays smooth.
 */

const BAYER_GLSL = /* glsl */ `
float clayBayerValue(vec2 pos, float cellSize) {
  vec2 cell = floor(mod(pos / cellSize, 4.0));
  int x = int(cell.x);
  int y = int(cell.y);
  if (x == 0) {
    if (y == 0) return 16.0 / 17.0;
    if (y == 1) return 5.0 / 17.0;
    if (y == 2) return 13.0 / 17.0;
    return 1.0 / 17.0;
  } else if (x == 1) {
    if (y == 0) return 8.0 / 17.0;
    if (y == 1) return 12.0 / 17.0;
    if (y == 2) return 4.0 / 17.0;
    return 9.0 / 17.0;
  } else if (x == 2) {
    if (y == 0) return 14.0 / 17.0;
    if (y == 1) return 2.0 / 17.0;
    if (y == 2) return 15.0 / 17.0;
    return 3.0 / 17.0;
  } else {
    if (y == 0) return 6.0 / 17.0;
    if (y == 1) return 10.0 / 17.0;
    if (y == 2) return 7.0 / 17.0;
    return 11.0 / 17.0;
  }
}
`

const CLAY_DITHER_GLSL = /* glsl */ `
uniform float clayCellSize;
uniform float clayBlackPoint;
uniform float clayWhitePoint;
uniform vec3 claySolid;
uniform vec3 clayShade;
${BAYER_GLSL}
vec3 clayDither(vec3 colour, vec2 fragCoord) {
  vec2 cell = floor(fragCoord / clayCellSize);
  float luminance = dot(colour, vec3(0.2126, 0.7152, 0.0722));
  float range = max(clayWhitePoint - clayBlackPoint, 1e-4);
  float brightness = clamp((luminance - clayBlackPoint) / range, 0.0, 1.0);
  return brightness <= clayBayerValue(cell * clayCellSize, clayCellSize) ? clayShade : claySolid;
}
`

export type ClayDitherOptions = {
  /** Bayer cell size in device pixels (rank uses 3). */
  cellSize: number
  /** Lit cells. */
  solid: { r: number; g: number; b: number }
  /** Shaded cells. */
  shade: { r: number; g: number; b: number }
  blackPoint?: number
  whitePoint?: number
  key: string
}

/** Patch a MeshStandardMaterial in place; colours are sRGB 0..1 (written after the colour-space step). */
export function applyClayDither(material: Material, options: ClayDitherOptions) {
  const target = material as MeshStandardMaterial
  if (!target.isMeshStandardMaterial) return false
  const { cellSize, solid, shade, blackPoint = 0.12, whitePoint = 0.95, key } = options
  target.onBeforeCompile = (shader) => {
    const source = shader.fragmentShader
    if (!source.includes("#include <common>") || !source.includes("#include <dithering_fragment>")) return
    shader.uniforms.clayCellSize = { value: cellSize }
    shader.uniforms.clayBlackPoint = { value: blackPoint }
    shader.uniforms.clayWhitePoint = { value: whitePoint }
    shader.uniforms.claySolid = { value: solid }
    shader.uniforms.clayShade = { value: shade }
    shader.fragmentShader = source
      .replace("#include <common>", `#include <common>\n${CLAY_DITHER_GLSL}`)
      .replace(
        "#include <dithering_fragment>",
        "gl_FragColor.rgb = clayDither(gl_FragColor.rgb, gl_FragCoord.xy);\n#include <dithering_fragment>"
      )
  }
  target.customProgramCacheKey = () => `clay-dither:${key}:${cellSize}:${blackPoint}:${whitePoint}`
  target.needsUpdate = true
  return true
}
