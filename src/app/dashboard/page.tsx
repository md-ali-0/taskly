export default function DashboardPage() {
  return (
    <section className="surface-card p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
        Dashboard
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-foreground">
        Taskly dashboard shell is ready.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        Public home page সরানো হয়েছে। এখন app flow starts from auth, then moves into dashboard.
      </p>
    </section>
  );
}
