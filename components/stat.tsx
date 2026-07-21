export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-cyan-200/15 bg-white/[0.04] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
