import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, LoaderCircle, PenLine } from 'lucide-react';
import { getListNotesQueryKey, useCreateNote } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import type { Note } from '@workspace/api-client-react';

type Category = 'story' | 'poem' | 'chapter' | 'other';
const categoryOptions: Array<{ value: Category; label: string; detail: string }> = [
  { value: 'story', label: 'Story', detail: 'A narrative or personal example' },
  { value: 'poem', label: 'Poem', detail: 'A verse, stanza, or close reading' },
  { value: 'chapter', label: 'Chapter', detail: 'A passage or chapter companion' },
  { value: 'other', label: 'Other', detail: 'An explanation that defies a label' },
];

export default function SharePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createNote = useCreateNote();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [subject, setSubject] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 2 || subject.trim().length < 2 || authorName.trim().length < 2 || content.trim().length < 10) {
      setError('Give your note a title, subject, name, and at least a few lines to work with.');
      return;
    }
    setError('');
    createNote.mutate({ data: { title: title.trim(), category, subject: subject.trim(), authorName: authorName.trim(), content: content.trim() } }, {
      onSuccess: (note: Note) => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        setLocation(`/notes/${note.id}`);
      },
      onError: () => setError('We couldn’t share that just now. Check your connection and try again.'),
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <Link href="/" data-testid="link-share-back" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft size={16} /> Back to discover</Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="animate-rise lg:pt-8">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[4px_4px_0_hsl(35_60%_33%/.25)]"><PenLine size={25} /></div>
          <p className="font-mono-app text-[11px] uppercase tracking-[.16em] text-muted-foreground">open a new page</p>
          <h1 className="mt-4 font-display text-[clamp(3.4rem,7vw,6.4rem)] leading-[.88] tracking-[-.07em]">Make the hard<br /><span className="text-[hsl(var(--destructive))]">part clearer.</span></h1>
          <p className="mt-7 max-w-sm text-base leading-7 text-muted-foreground">Share the thing that finally made it click. A tidy summary, a surprising connection, a passage worth rereading — all of it belongs here.</p>
          <div className="mt-10 hidden border-l-2 border-[hsl(var(--accent))] pl-5 sm:block"><p className="font-display text-lg leading-7">“The best notes don’t replace the reading. They leave a light on beside it.”</p><p className="mt-2 font-mono-app text-[10px] uppercase tracking-[.12em] text-muted-foreground">a StudyShare principle</p></div>
        </div>
        <form onSubmit={submit} data-testid="form-share-note" className="rounded-3xl border border-card-border bg-card p-6 shadow-[var(--shadow-md)] sm:p-9">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-5"><div><p className="font-mono-app text-[10px] uppercase tracking-[.14em] text-muted-foreground">note details</p><h2 className="mt-1 font-display text-2xl">Tell us about it</h2></div><FileText size={23} className="text-[hsl(var(--accent-foreground))]" /></div>
          <div className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold">Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} data-testid="input-note-title" placeholder="The bit about memory palaces..." className="share-input" /></label>
            <div><span className="mb-2 block text-sm font-bold">What kind of note is this?</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{categoryOptions.map((option) => <button type="button" key={option.value} data-testid={`select-category-${option.value}`} onClick={() => setCategory(option.value)} className={`rounded-xl border p-3 text-left transition-all ${category === option.value ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.15)] shadow-[2px_2px_0_hsl(35_60%_33%/.15)]' : 'border-border bg-background hover:bg-secondary'}`}><span className="block text-sm font-bold">{option.label}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{option.detail}</span></button>)}</div></div>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold">Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} data-testid="input-note-subject" placeholder="Literature · Year 2" className="share-input" /></label><label className="block"><span className="mb-2 block text-sm font-bold">Your name</span><input value={authorName} onChange={(event) => setAuthorName(event.target.value)} data-testid="input-note-author" placeholder="How should we credit you?" className="share-input" /></label></div>
            <label className="block"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold">The note</span><span className={`font-mono-app text-[10px] ${content.length > 10000 ? 'text-[hsl(var(--destructive))]' : 'text-muted-foreground'}`}>{content.length.toLocaleString()} / 10,000</span></div><textarea value={content} onChange={(event) => setContent(event.target.value.slice(0, 10000))} data-testid="textarea-note-content" placeholder="Write it as if you’re explaining it to a friend at the library..." rows={10} className="share-input min-h-56 resize-y leading-6" /></label>
          </div>
          {error && <p data-testid="status-share-error" className="mt-5 rounded-xl bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p>}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">Your note will be public to fellow students.</p><button type="submit" data-testid="button-submit-note" disabled={createNote.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_hsl(35_60%_33%/.3)] disabled:cursor-wait disabled:opacity-70">{createNote.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <><span>Publish note</span><ArrowRight size={16} /></>}</button></div>
          {createNote.isSuccess && <p className="mt-4 flex items-center justify-end gap-2 text-sm font-semibold text-[#587a4a]"><Check size={15} /> Shared — opening your note...</p>}
        </form>
      </div>
    </div>
  );
}