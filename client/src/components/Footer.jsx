export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white px-4 py-10 text-ink">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <img src="/mobile-world-logo-header.png" alt="Mobile World Phones and Accessories" className="h-16 w-auto max-w-[260px] object-contain" />
          <p className="mt-2 max-w-xl text-sm text-muted">PTA Approved and Factory Unlocked phones only. Star City Mall, Karachi. Meezan Bank transfer, then shop pickup.</p>
        </div>
        <div className="text-sm font-semibold text-muted">7-day checking warranty</div>
      </div>
    </footer>
  );
}
