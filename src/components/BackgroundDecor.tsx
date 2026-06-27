export default function BackgroundDecor() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(142,152,168,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(142,152,168,0.08)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
      <div className="absolute left-8 top-28 h-px w-72 -rotate-6 bg-gradient-to-r from-transparent via-accent-calm/30 to-transparent"></div>
      <div className="absolute right-0 top-1/3 h-px w-96 rotate-12 bg-gradient-to-r from-transparent via-accent-warm/35 to-transparent"></div>
      <div className="absolute bottom-24 left-1/4 h-px w-80 rotate-3 bg-gradient-to-r from-transparent via-muted/25 to-transparent"></div>
    </div>
  );
}
