import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Download, Heart, HeartHandshake, Menu, PenLine, X } from 'lucide-react';
import { getHealthCheckQueryKey, useHealthCheck } from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import qrCode from '@assets/IMG_20260816_072810_1786845528536.jpg';

function NavItem({ href, label }: { href: string; label: string }) {
  const [location] = useLocation();
  const active = href === '/' ? location === '/' : location.startsWith(href);
  return (
    <Link
      href={href}
      data-testid={`link-nav-${label.toLowerCase()}`}
      className={`relative rounded-full px-3 py-2 text-sm font-semibold transition-colors ${active ? 'bg-[hsl(var(--secondary))] text-foreground' : 'text-[hsl(var(--sidebar-foreground)/.74)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}
    >
      {label}
      {active && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-[hsl(var(--accent))]" />}
    </Link>
  );
}

export function StudyShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const healthQuery = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  const healthy = Boolean(healthQuery.data?.status);

  useEffect(() => {
    if (!donationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDonationOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [donationOpen]);

  return (
    <div className="paper-noise min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] shadow-[0_3px_20px_hsl(222_35%_19%/.12)]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" data-testid="link-brand" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[3px_3px_0_hsl(35_60%_33%/.35)] transition-transform group-hover:-rotate-3 group-active:translate-y-px">
              <BookOpen size={21} strokeWidth={2.4} />
            </span>
            <span className="font-display text-[23px] tracking-[-.04em]">StudyShare</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <NavItem href="/" label="Discover" />
            <NavItem href="/liked" label="Liked notes" />
            <NavItem href="/downloads" label="Downloads" />
            <NavItem href="/share" label="Share a note" />
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground)/.62)]">
              <span className={`h-2 w-2 rounded-full ${healthy ? 'bg-[#97bd82]' : 'bg-[hsl(var(--accent))]'}`} />
              <span>{healthy ? 'The shelf is open' : 'Checking the shelf'}</span>
            </div>
            <Link href="/share" data-testid="button-header-share" className="group flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_hsl(35_60%_33%/.4)] active:translate-y-0">
              <PenLine size={15} />
              Add yours
            </Link>
          </div>

          <button
            type="button"
            data-testid="button-toggle-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] sm:hidden"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[hsl(var(--sidebar-border))] px-5 py-4 sm:hidden">
            <div className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} data-testid="link-mobile-discover" className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[hsl(var(--sidebar-accent))]">Discover notes</Link>
              <Link href="/liked" onClick={() => setMenuOpen(false)} data-testid="link-mobile-liked" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[hsl(var(--sidebar-accent))]"><Heart size={15} /> Liked notes</Link>
              <Link href="/downloads" onClick={() => setMenuOpen(false)} data-testid="link-mobile-downloads" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[hsl(var(--sidebar-accent))]"><Download size={15} /> Downloads</Link>
              <Link href="/share" onClick={() => setMenuOpen(false)} data-testid="link-mobile-share" className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[hsl(var(--sidebar-accent))]">Share a note</Link>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-display text-base text-foreground">Keep the good explanations moving.</span>
        <span className="font-mono-app text-[11px] uppercase tracking-[.14em]">StudyShare · shared by students</span>
      </footer>
      <button
        type="button"
        data-testid="button-donate"
        onClick={() => setDonationOpen(true)}
        className="fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-3.5 py-2 font-mono-app text-[10px] font-medium uppercase tracking-[.12em] text-[hsl(var(--accent-foreground))] shadow-[0_4px_16px_hsl(35_60%_33%/.24)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_18px_hsl(35_60%_33%/.3)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
      >
        <HeartHandshake size={14} />
        Donate
      </button>
      <div className="fixed bottom-3 right-3 z-40 rounded-full border border-[hsl(var(--border)/.75)] bg-[hsl(var(--card)/.92)] px-3 py-1.5 font-mono-app text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] shadow-[0_4px_16px_hsl(222_35%_19%/.12)] backdrop-blur-sm">
        Credited to SAUJAS PRATAP SINGH
      </div>
      {donationOpen && (
        <div
          className="animate-donation-overlay fixed inset-0 z-50 grid place-items-center bg-[hsl(222_35%_19%/.66)] p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDonationOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-title"
            className="animate-donation-in relative w-full max-w-sm rounded-[1.5rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 text-center shadow-[0_24px_70px_hsl(222_35%_19%/.28)] sm:p-6"
          >
            <button
              type="button"
              data-testid="button-close-donation"
              aria-label="Close donation dialog"
              onClick={() => setDonationOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            >
              <X size={18} />
            </button>
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.22)] text-[hsl(var(--accent-foreground))]">
              <HeartHandshake size={22} />
            </div>
            <p className="font-mono-app text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Support the shared shelf</p>
            <h2 id="donation-title" className="mt-2 font-display text-3xl text-foreground">Donate to StudyShare</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">If these notes helped you learn, scan the QR code to leave a contribution.</p>
            <div className="mx-auto mt-5 w-fit rounded-2xl border border-[hsl(var(--border))] bg-white p-2 shadow-[0_8px_25px_hsl(222_35%_19%/.1)]">
              <img src={qrCode} alt="Donation QR code" className="animate-donation-qr block h-56 w-56 object-contain sm:h-64 sm:w-64" />
            </div>
            <p className="mt-4 font-mono-app text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Thank you for supporting student learning</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SectionMarker({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex items-center gap-2 font-mono-app text-[11px] font-medium uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]"><span className="h-px w-7 bg-[hsl(var(--accent))]" />{children}</div>;
}

export function LoadingCard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => <div key={item} className="rounded-2xl border border-card-border bg-card p-5"><div className="skeleton mb-5 h-5 w-20 rounded-full" /><div className="skeleton mb-3 h-7 w-4/5 rounded-lg" /><div className="skeleton mb-2 h-3 w-full rounded" /><div className="skeleton mb-7 h-3 w-3/5 rounded" /><div className="flex justify-between"><div className="skeleton h-8 w-28 rounded-full" /><div className="skeleton h-8 w-16 rounded-full" /></div></div>)}
    </div>
  );
}