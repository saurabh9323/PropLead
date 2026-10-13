export default function Loading() {
  return (
    <>
      <div className="h-8 w-40 rounded bg-slate-200" />
      <div className="mt-6 h-28 rounded-md border border-slate-200 bg-white" />
      <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        {[1, 2, 3, 4, 5].map((item) => (
          <div className="border-b border-slate-100 p-4" key={item}>
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </>
  );
}
