export default function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/[0.08] p-4"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full mt-0.5 shrink-0 bg-white/[0.1]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 rounded w-2/3 bg-white/[0.1]" />
                <div className="h-5 rounded-full w-16 shrink-0 bg-white/[0.08]" />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-3 rounded w-24 bg-white/[0.06]" />
                <div className="h-3 rounded w-20 bg-white/[0.06]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
