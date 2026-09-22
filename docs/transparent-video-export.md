# Transparent Video Exports

Use the alpha-preserving VP9 command below when converting an AVI with a transparent background into a browser-ready WebM.

```powershell
ffmpeg -y -v error -i "C:\path\to\input.avi" `
  -an -vf format=yuva420p `
  -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 `
  -metadata:s:v:0 alpha_mode=1 `
  -crf 32 -b:v 0 -row-mt 1 `
  "apps/web/public/video/output.webm"
```

Important details:

- Keep `format=yuva420p` and `-pix_fmt yuva420p`; `yuv420p` flattens transparency.
- Keep `-auto-alt-ref 0`; alternate reference frames can strip the alpha plane.
- Keep `-metadata:s:v:0 alpha_mode=1` so WebM consumers know the stream carries alpha.
- Do not composite onto white or black before encoding.
- Verify the source has an alpha channel with `ffprobe` reporting `pix_fmt=bgra` or `rgba`.

The output may still show `yuv420p` in `ffprobe` even when the WebM carries the `alpha_mode=1` metadata. Preserve the full command above rather than replacing it with a plain VP9 conversion.
