import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Download, Heart, LoaderCircle, Quote, Share2 } from 'lucide-react';
import { getGetNoteQueryKey, useGetNote, useLikeNote } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import type { Note } from '@workspace/api-client-react';
import { categoryMeta, formatDate } from '@/components/note-card';
import { SectionMarker } from '@/components/study-shell';
import { hasLikedNote, rememberLikedNote } from '@/lib/liked-notes';
import { rememberDownloadedNote } from '@/lib/downloaded-notes';

function DetailSkeleton() {
  return <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20"><div className="skeleton mb-8 h-5 w-28 rounded-full" /><div className="skeleton h-16 w-4/5 rounded-xl" /><div className="skeleton mt-4 h-5 w-48 rounded" /><div className="skeleton mt-14 h-72 w-full rounded-2xl" /></div>;
}

function downloadNote(note: Note) {
  const body = `${note.title}\n${note.subject}\n\nShared by ${note.authorName}\n\n${note.content}\n`;
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'studyshare-note'}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function NoteDetailPage() {
  const params = useParams<{ id?: string }>();
  const noteId = Number(params.id);
  const validId = Number.isInteger(noteId) && noteId > 0;
  const queryClient = useQueryClient();
  const noteQuery = useGetNote(validId ? noteId : 0, { query: { enabled: validId, queryKey: getGetNoteQueryKey(validId ? noteId : 0) } });
  const likeMutation = useLikeNote();
  const [liked, setLiked] = useState(() => (validId ? hasLikedNote(noteId) : false));
  const [downloaded, setDownloaded] = useState(false);
  const note = noteQuery.data as Note | undefined;
  const meta = note ? categoryMeta[note.category] : categoryMeta.other;

  useEffect(() => {
    setLiked(validId ? hasLikedNote(noteId) : false);
  }, [noteId, validId]);

  const handleLike = () => {
    if (!note || likeMutation.isPending || liked) return;
    likeMutation.mutate({ id: note.id }, {
      onSuccess: (response) => {
        setLiked(true);
        rememberLikedNote(note.id);
        queryClient.setQueryData(getGetNoteQueryKey(note.id), (current: Note | undefined) => current ? { ...current, likes: response.likes } : current);
        queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      },
    });
  };
  const handleDownload = () => {
    if (!note) return;
    downloadNote(note);
    rememberDownloadedNote(note);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2400);
  };

  if (!validId || (!noteQuery.isLoading && !noteQuery.data)) return <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary"><Quote size={28} /></div><h1 className="mt-6 font-display text-4xl tracking-[-.05em]">That page is a blank margin.</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{noteQuery.isError ? 'This note may have moved, or the shelf is offline for a moment.' : 'We couldn’t find the note you were looking for.'}</p><div className="mt-7 flex flex-wrap items-center justify-center gap-3">{noteQuery.isError && <button type="button" data-testid="button-retry-detail" onClick={() => noteQuery.refetch()} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary">Try again</button>}<Link href="/" data-testid="link-not-found-back" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"><ArrowLeft size={16} /> Back to the shelf</Link></div></div>;
  if (noteQuery.isLoading || !note) return <DetailSkeleton />;

  return (
    <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      <Link href="/" data-testid="link-back-discover" className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={16} /> Back to discover</Link>
      <header className="animate-rise">
        <div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1 font-mono-app text-[10px] font-medium uppercase tracking-[.13em] ${meta.color}`}>{meta.label}</span><span className="font-mono-app text-[11px] uppercase tracking-[.13em] text-muted-foreground">{note.subject}</span></div>
        <h1 data-testid="text-detail-title" className="mt-6 max-w-3xl font-display text-[clamp(3rem,8vw,6.5rem)] leading-[.9] tracking-[-.07em]">{note.title}</h1>
        <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-mono-app text-[10px] font-medium text-primary-foreground">{note.authorInitials}</span><span><strong className="text-foreground">{note.authorName}</strong><br /><span className="font-mono-app text-[10px]">{formatDate(note.createdAt)}</span></span><span className="h-5 w-px bg-border" /><span className="flex items-center gap-1.5"><Heart size={15} /> <span data-testid="text-detail-likes">{note.likes}</span> appreciations</span></div>
      </header>
      <div className="my-12 h-px bg-border" />
      <div className="relative rounded-3xl border border-card-border bg-card px-6 py-9 shadow-[var(--shadow-sm)] sm:px-14 sm:py-14">
        <Quote size={50} strokeWidth={1} className="absolute -left-3 -top-5 text-[hsl(var(--accent))]" />
        <div data-testid="text-detail-content" className="whitespace-pre-wrap font-display text-[20px] leading-[1.75] tracking-[-.01em] text-foreground sm:text-[23px]">{note.content}</div>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Found a sentence worth keeping? Let the author know.</p>
        <div className="flex gap-2">
          <button type="button" data-testid="button-like-note" onClick={handleLike} disabled={likeMutation.isPending || liked} className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all ${liked ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.18)] text-foreground' : 'border-border bg-card hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]'}`}>
            {likeMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : liked ? <Check size={16} /> : <Heart size={16} />} {liked ? 'Liked' : 'Like this'}
          </button>
          <button type="button" data-testid="button-download-note" onClick={handleDownload} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_0_hsl(35_60%_33%/.3)]">{downloaded ? <Check size={16} /> : <Download size={16} />} {downloaded ? 'Saved' : 'Download'}</button>
          <button type="button" data-testid="button-share-note" onClick={() => { if (navigator.share) navigator.share({ title: note.title, text: note.content, url: window.location.href }); else navigator.clipboard?.writeText(window.location.href); }} aria-label="Share note" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Share2 size={16} /></button>
        </div>
      </div>
      {likeMutation.isError && <p className="mt-3 text-right text-sm text-[hsl(var(--destructive))]">We couldn’t save that like. Please try again.</p>}
      <div className="mt-20 rounded-2xl bg-[hsl(var(--secondary))] p-6 sm:flex sm:items-center sm:justify-between sm:p-8"><div><SectionMarker>pass it on</SectionMarker><h2 className="font-display text-2xl tracking-[-.04em]">Have a useful page of your own?</h2><p className="mt-1 text-sm text-muted-foreground">Someone else is probably looking for exactly that.</p></div><Link href="/share" data-testid="link-detail-share" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground sm:mt-0">Share a note</Link></div>
    </article>
  );
}