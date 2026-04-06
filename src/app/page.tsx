export default function Home() {
  return (
    <main className="app-shell flex min-h-screen items-center py-16">
      <section className="grid w-full gap-6 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="surface-card overflow-hidden p-8 sm:p-10">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Frontend foundation
          </span>
          <h1 className="text-balance mt-6 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Taskly frontend এখন clean Tailwind structure দিয়ে শুরু হয়েছে।
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            এই base setup-এর উপর আমরা next step-এ Ant Design, providers, redux,
            types, আর auth flow reference project-এর মতো layer করে বসাতে পারব।
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border bg-background px-4 py-2 text-sm font-medium">
              Tailwind v4 tokens
            </div>
            <div className="rounded-full border bg-background px-4 py-2 text-sm font-medium">
              Shared global styles
            </div>
            <div className="rounded-full border bg-background px-4 py-2 text-sm font-medium">
              Ready for Ant Design
            </div>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Planned structure
          </p>
          <div className="mt-6 space-y-4">
            {[
              "src/styles দিয়ে single style entry",
              "theme tokens future Ant Design bridge-ready",
              "layout font + root styling aligned",
              "provider/redux/auth layer next step-এর জন্য clean base",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border bg-background/80 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
