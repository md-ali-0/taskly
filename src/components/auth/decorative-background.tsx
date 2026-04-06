export default function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-18 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute left-[12%] top-[22%] h-3 w-3 rounded-full bg-primary/45" />
      <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-sky-500/55" />
      <div className="absolute right-[16%] top-[18%] h-4 w-4 rotate-45 bg-primary/30" />
      <div className="absolute right-[22%] bottom-[24%] h-3 w-3 rounded-full border border-primary/30" />
      <div className="absolute bottom-[-140px] left-[-120px] h-[380px] w-[380px] rounded-full border border-primary/15" />
      <div className="absolute right-[-100px] top-[-90px] h-[300px] w-[300px] rounded-full border border-sky-400/15" />
    </div>
  );
}
