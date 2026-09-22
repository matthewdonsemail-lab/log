export function CompetitorLogo({
  type,
  className = 'size-9'
}: {
  type: 'listeningkit' | 'octolens' | 'brand24' | 'syften'
  className?: string
}) {
  if (type === 'listeningkit') {
    return (
      <img
        src="/logo.svg"
        alt="ListeningKit"
        className={`${className} rounded-[10px] object-contain shadow-sm`}
      />
    )
  }

  if (type === 'octolens') {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-[10px] bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white shadow-sm`}
        title="Octolens"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 9 9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 15a3 3 0 0 0 3-3" />
        </svg>
      </div>
    )
  }

  if (type === 'brand24') {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-[10px] bg-[#00C389] font-black text-white shadow-sm`}
        title="Brand24"
      >
        <span className="text-xs tracking-tighter">B24</span>
      </div>
    )
  }

  // syften
  return (
    <div
      className={`${className} flex items-center justify-center rounded-[10px] bg-[#3B82F6] text-white shadow-sm`}
      title="Syften"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 6a6 6 0 1 0 6 6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}
