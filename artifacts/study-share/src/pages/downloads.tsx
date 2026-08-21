import { Download, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { categoryMeta, formatDate } from '@/components/note-card';
import { SectionMarker } from '@/components/study-shell';
import {
  getDownloadedNotes,
  subscribeToDownloadedNotes,
  type DownloadedNote,
} from '@/lib/downloaded-notes';

function formatDownloadedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved on this device';
  return `Downloaded ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)}`;
}

function DownloadedNoteCard({ item, index }: { item: DownloadedNote; index: number }) {
  const note = item.note;
  const meta = categoryMeta[note.category];
  const excerpt = note.content.replace(/\s+/g, ' ').trim();

  return (
    <Link
      href={`/notes/${note.id}`}
      data-testid={`card-downloaded-note-${note.id}`}
      className="group animate-rise relative flex min-h-[285px] flex-col overflow-hidden rounded-2xl border border-card-border bg-card p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.7)] hover:shadow-[var(--shadow-md)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 font-mono-app text-[10px] font-medium uppercase tracking-[.13em] ${meta.color}`}>{meta.label}</span>
        <Download size={16} className="text-[hsl(var(--accent-foreground))]" />
      </div>
      <div className="relative flex-1">
        <FileText size={28} strokeWidth={1.3} className="absolute -left-1 -top-2 text-[hsl(var(--accent)/.28)]" />
        <h2 data-testid={`text-downloaded-title-${note.id}`} className="relative max-w-[90%] font-display text-[25px] leading-[1.08] tracking-[-.035em] text-foreground">{note.title}</h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">{note.subject}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{excerpt}</p>
      </div>
      <div className="mt-5 border-t border-card-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] font-mono-app text-[10px] font-medium text-[hsl(var(--primary-foreground))]">{note.authorInitials}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{note.authorName}</p>
              <p className="font-mono-app text-[10px] text-muted-foreground">{formatDate(note.createdAt)}</p>
            </div>
          </div>
          <span className="shrink-0 font-mono-app text-[10px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">Open note</span>
        </div>
        <p className="mt-3 font-mono-app text-[10px] uppercase tracking-[.1em] text-[hsl(var(--accent-foreground))]">{formatDownloadedAt(item.downloadedAt)}</p>
      </div>
    </Link>
  );
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadedNote[]>(getDownloadedNotes);

  useEffect(() => subscribeToDownloadedNotes(() => setDownloads(getDownloadedNotes())), []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="animate-rise flex flex-col gap-7 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionMarker>your downloaded shelf</SectionMarker>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-5xl tracking-[-.06em] sm:text-7xl">Downloads.</h1>
            <Download size={27} className="mt-2 text-[hsl(var(--accent))]" />
          </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Chapters, stories, and poems you saved as text files. Your download history stays on this device for easy revisiting.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 font-mono-app text-[11px] uppercase tracking-[.12em] text-muted-foreground sm:self-auto">
          <Download size={14} className="text-[hsl(var(--accent-foreground))]" />
          {downloads.length} {downloads.length === 1 ? 'download' : 'downloads'}
        </div>
      </header>

      <section className="pt-10">
        {downloads.length === 0 ? (
          <div className="paper-grid relative overflow-hidden rounded-3xl border border-card-border bg-card px-6 py-16 text-center sm:px-12">
            <div className="animate-float mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[22px] border-2 border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
              <Download size={28} strokeWidth={1.6} />
            </div>
            <h2 className="font-display text-3xl tracking-[-.04em]">No downloads yet.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Open any note and tap Download. It will save a readable text file and appear here.
            </p>
            <Link
              href="/"
              data-testid="button-browse-downloads"
              className="mt-7 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Browse the shelf
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {downloads.map((item, index) => (
              <DownloadedNoteCard key={`${item.note.id}-${item.downloadedAt}`} item={item} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}