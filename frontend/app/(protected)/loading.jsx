export default function WorkspaceLoading() {
  return <section aria-label="Loading workspace content" aria-busy="true" className="animate-pulse space-y-6"><div className="h-8 w-56 rounded-lg bg-slate-200" /><div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="h-28 rounded-xl bg-slate-100" />)}</div><div className="h-64 rounded-xl bg-slate-100" /></section>;
}
