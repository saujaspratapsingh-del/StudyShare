import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:py-32">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary"><Compass size={28} strokeWidth={1.5} /></div>
      <p className="mt-7 font-mono-app text-[11px] uppercase tracking-[.16em] text-muted-foreground">page not found</p>
      <h1 className="mt-3 font-display text-5xl tracking-[-.06em]">A page went wandering.</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Let’s get you back to the shared shelf.</p>
      <Link href="/" data-testid="link-404-home" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"><ArrowLeft size={16} /> Return home</Link>
    </div>
  );
}