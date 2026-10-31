/**
 * Masked type section. Giant blue "listening kit" wordmark over the blue
 * grid, sitting in place.
 */
export function Stateful() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #2A8CFF 2px, transparent 2px), linear-gradient(to bottom, #2A8CFF 2px, transparent 2px)',
          backgroundSize: '80px 80px',
        }}
      />
      <span className="relative w-max font-black lowercase leading-none whitespace-nowrap text-[clamp(2.5rem,12vw,12rem)] text-[#2A8CFF]">
        listening kit
      </span>
    </section>
  )
}
