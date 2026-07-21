export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-cyan-200/15 bg-white/[0.04] p-2.5 sm:p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-xs">{label}</p>
      <p className="mt-1 text-base font-black text-white sm:text-lg">{value}</p>
    </div>
  );
}
