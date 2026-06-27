export default function BackgroundDecor() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-accent-warm/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 -right-32 w-[26rem] h-[26rem] bg-accent-calm/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-calm/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-warm/20 rounded-full blur-3xl"></div>
    </div>
  );
}
