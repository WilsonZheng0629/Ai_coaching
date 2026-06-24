import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-navy-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link className="focus-ring text-xl font-black tracking-tight" href="/">
          Athlet<span className="text-volt">IQ</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
          <Link className="focus-ring hover:text-white" href="/profile">
            Profile
          </Link>
          <Link className="focus-ring hover:text-white" href="/dashboard">
            Dashboard
          </Link>
          <Link className="focus-ring hover:text-white" href="/player-matches">
            Pro Matches
          </Link>
          <Link className="focus-ring hover:text-white" href="/validation">
            Validation
          </Link>
          <Link
            className="focus-ring rounded-md bg-volt px-4 py-2 font-bold text-navy-950 transition hover:bg-white"
            href="/upload"
          >
            Try Free
          </Link>
        </nav>
      </div>
    </header>
  );
}
