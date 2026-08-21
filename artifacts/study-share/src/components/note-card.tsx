import { ArrowUpRight, Heart, Quote } from 'lucide-react';
import { Link } from 'wouter';
import type { Note } from '@workspace/api-client-react';

const categoryMeta: Record<Note['category'], { label: string; color: string }> = {
  story: { label: 'Story', color: 'bg-[#e6d8c5] text-[#74563c]' },
  poem: { label: 'Poem', color: 'bg-[#e2ddd2] text-[#586451]' },
  chapter: { label: 'Chapter', color: 'bg-[#f2d3a0] text-[#80521e]' },
  other: { label: 'Other', color: 'bg-[#dce1e5] text-[#475561]' },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently shared';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function NoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const meta = categoryMeta[note.category];
  const excerpt = note.content.replace(/\s+/g, ' ').trim();
  return (
    <Link
      href={`/notes/${note.id}`}
      data-testid={`card-note-${note.id}`}
      className="group animate-rise relative flex min-h-[265px] flex-col overflow-hidden rounded-2xl border border-card-border bg-card p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.7)] hover:shadow-[var(--shadow-md)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span data-testid={`badge-category-${note.id}`} className={`rounded-full px-3 py-1 font-mono-app text-[10px] font-medium uppercase tracking-[.13em] ${meta.color}`}>{meta.label}</span>
        <ArrowUpRight size={17} className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[hsl(var(--accent-foreground))]" />
      </div>
      <div className="relative flex-1">
        <Quote size={29} strokeWidth={1.3} className="absolute -left-1 -top-2 text-[hsl(var(--accent)/.25)]" />
        <h3 data-testid={`text-note-title-${note.id}`} className="relative max-w-[90%] font-display text-[25px] leading-[1.08] tracking-[-.035em] text-foreground">{note.title}</h3>
        <p data-testid={`text-note-subject-${note.id}`} className="mt-2 text-xs font-bold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">{note.subject}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{excerpt}</p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-card-border pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] font-mono-app text-[10px] font-medium text-[hsl(var(--primary-foreground))]">{note.authorInitials}</span>
          <div className="min-w-0">
            <p data-testid={`text-note-author-${note.id}`} className="truncate text-xs font-semibold">{note.authorName}</p>
            <p className="font-mono-app text-[10px] text-muted-foreground">{formatDate(note.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Heart size={14} className="transition-transform group-hover:scale-110" /> <span data-testid={`text-note-likes-${note.id}`}>{note.likes}</span></div>
      </div>
    </Link>
  );
}

export { categoryMeta, formatDate };