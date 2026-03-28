export default function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-gray-200 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-5 bg-gray-200 rounded-full w-16 shrink-0" />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
