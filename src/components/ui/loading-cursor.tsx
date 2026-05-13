export default function LoadingCursor() {
  return (
    <div className="relative m-2 size-6 animate-[loading-cursor-rotate_1s_linear_infinite] self-start">
      <span className="absolute left-2 top-0 size-2 animate-[loading-cursor-dot-pulse_0.6s_infinite_ease-in-out] rounded-full bg-brand-primary/60" />
      <span className="absolute right-0 top-2 size-2 animate-[loading-cursor-dot-pulse_0.6s_infinite_ease-in-out_0.15s] rounded-full bg-brand-primary/70" />
      <span className="absolute bottom-0 left-2 size-2 animate-[loading-cursor-dot-pulse_0.6s_infinite_ease-in-out_0.3s] rounded-full bg-brand-primary/80" />
      <span className="absolute left-0 top-2 size-2 animate-[loading-cursor-dot-pulse_0.6s_infinite_ease-in-out_0.45s] rounded-full bg-brand-primary" />
    </div>
  );
}