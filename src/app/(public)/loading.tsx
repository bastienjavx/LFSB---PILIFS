export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Chargement">
      <div className="skeleton h-9 w-64 rounded-lg" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="skeleton aspect-square w-full" />
            <div className="space-y-2 p-3">
              <div className="skeleton mx-auto h-4 w-3/4 rounded" />
              <div className="skeleton mx-auto h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
