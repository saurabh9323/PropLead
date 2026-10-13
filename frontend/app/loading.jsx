export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-44 rounded-md bg-slate-200" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-lg border border-slate-200 bg-white p-5">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-5 h-8 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
