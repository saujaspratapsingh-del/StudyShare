import { useEffect, useMemo, useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { useListNotes } from '@workspace/api-client-react';
import type { Note } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { NoteCard } from '@/components/note-card';
import { LoadingCard, SectionMarker } from '@/components/study-shell';
import { getLikedNoteIds, subscribeToLikedNotes } from '@/lib/liked-notes';

export default function LikedNotesPage() {
  const [likedIds, setLikedIds] = useState<number[]>(getLikedNoteIds);
  const notesQuery = useListNotes({ sort: 'recent' });
  const notes = (notesQuery.data ?? []) as Note[];
  const likedNotes = useMemo(
    () => notes.filter((note) => likedIds.includes(note.id)),
    [likedIds, notes],
  );

  useEffect(() => subscribeToLikedNotes(() => setLikedIds(getLikedNoteIds())), []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="animate-rise flex flex-col gap-7 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionMarker>your saved shelf</SectionMarker>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-5xl tracking-[-.06em] sm:text-7xl">Liked notes.</h1>
            <Heart size={27} className="animate-heart-beat mt-2 fill-[hsl(var(--accent)/.2)] text-[hsl(var(--accent))]" />
          </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            The explanations you chose to keep close. Your liked notes are saved on this device for the next study session.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 font-mono-app text-[11px] uppercase tracking-[.12em] text-muted-foreground sm:self-auto">
          <Heart size={14} className="text-[hsl(var(--accent-foreground))]" />
          {likedIds.length} {likedIds.length === 1 ? 'note' : 'notes'} saved
        </div>
      </header>

      <section className="pt-10">
        {notesQuery.isLoading ? (
          <LoadingCard />
        ) : notesQuery.isError ? (
          <div className="rounded-3xl border border-[hsl(var(--destructive)/.35)] bg-[hsl(var(--destructive)/.06)] p-10 text-center">
            <h2 className="font-display text-3xl">Your shelf is taking a breather.</h2>
            <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t load your liked notes right now.</p>
            <button
              type="button"
              data-testid="button-retry-liked"
              onClick={() => notesQuery.refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : likedNotes.length === 0 ? (
          <div className="paper-grid relative overflow-hidden rounded-3xl border border-card-border bg-card px-6 py-16 text-center sm:px-12">
            <div className="animate-float mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[22px] border-2 border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
              <Heart size={28} strokeWidth={1.6} />
            </div>
            <h2 className="font-display text-3xl tracking-[-.04em]">Nothing liked yet.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              When a note makes something click, tap Like this and it will be waiting for you here.
            </p>
            <Link
              href="/"
              data-testid="button-browse-liked"
              className="mt-7 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Browse the shelf
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {likedNotes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}