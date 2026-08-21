import { useMemo, useState } from 'react';
import { ArrowDownUp, BookMarked, ChevronDown, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useListNotes, useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';
import type { ListNotesParams, Note } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { NoteCard } from '@/components/note-card';
import { LoadingCard, SectionMarker } from '@/components/study-shell';

type FilterCategory = 'all' | Note['category'];
type SortMode = 'recent' | 'popular';
const categories: Array<{ value: FilterCategory; label: string }> = [
  { value: 'all', label: 'Everything' },
  { value: 'story', label: 'Stories' },
  { value: 'poem', label: 'Poems' },
  { value: 'chapter', label: 'Chapters' },
  { value: 'other', label: 'Other notes' },
];

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="paper-grid relative overflow-hidden rounded-3xl border border-card-border bg-card px-6 py-16 text-center sm:px-12">
      <div className="relative mx-auto max-w-md">
        <div className="animate-float mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[22px] border-2 border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><BookMarked size={27} strokeWidth={1.6} /></div>
        <h2 className="font-display text-3xl tracking-[-.04em]">{hasFilters ? 'Nothing on this page yet.' : 'The first page is yours.'}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{hasFilters ? 'Try another shelf, or clear your filters to see the whole collection.' : 'Share the explanation, passage, or tiny breakthrough you wish you had before the exam.'}</p>
        {hasFilters ? <button type="button" data-testid="button-empty-reset" onClick={onReset} className="mt-7 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary">Clear filters</button> : <Link href="/share" data-testid="button-empty-share" className="mt-7 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">Share the first note</Link>}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [sort, setSort] = useState<SortMode>('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const params = useMemo<ListNotesParams>(() => ({ search: search.trim() || undefined, category: category === 'all' ? undefined : category, sort }), [search, category, sort]);
  const notesQuery = useListNotes(params);
  useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  const notes = (notesQuery.data ?? []) as Note[];
  const hasFilters = Boolean(search.trim() || category !== 'all');
  const resultsKey = `${search.trim()}-${category}-${sort}`;

  return (
    <div>
      <section className="relative overflow-hidden bg-[hsl(var(--secondary))]">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[36px] border-[hsl(var(--accent)/.28)]" />
        <div className="absolute bottom-[-110px] left-[46%] h-56 w-56 rounded-full border-[24px] border-[hsl(var(--accent)/.18)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <div className="max-w-3xl animate-rise">
            <SectionMarker>the shared shelf</SectionMarker>
            <h1 className="max-w-2xl font-display text-[clamp(3.4rem,9vw,7.3rem)] leading-[.87] tracking-[-.07em] text-foreground">Notes for the<br /><span className="relative inline-block text-[hsl(var(--destructive))]">next version of you.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">A growing collection of stories, passages, and explanations shared by students who remember what it felt like to be stuck.</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="group flex h-14 flex-1 items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] px-4 shadow-[var(--shadow-sm)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:shadow-[0_0_0_3px_hsl(var(--accent)/.22)] sm:max-w-xl">
              <Search size={20} className="text-muted-foreground transition-colors group-focus-within:text-[hsl(var(--accent-foreground))]" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, subject, or idea..." data-testid="input-search-notes" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              {search && <button type="button" data-testid="button-clear-search" aria-label="Clear search" onClick={() => setSearch('')} className="rounded-full p-1 text-muted-foreground hover:bg-secondary"><X size={16} /></button>}
            </div>
            <Link href="/share" data-testid="button-hero-share" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_hsl(35_60%_33%/.32)] active:translate-y-0"><Sparkles size={17} /> Share a useful note</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><SectionMarker>browse the shelf</SectionMarker><h2 className="font-display text-4xl tracking-[-.05em]">Find your footing.</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" data-testid="button-toggle-filters" onClick={() => setFiltersOpen((open) => !open)} className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary lg:hidden"><SlidersHorizontal size={16} /> Filters <ChevronDown size={15} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} /></button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
              <ArrowDownUp size={15} className="text-muted-foreground" />
              <label htmlFor="sort-notes" className="text-muted-foreground">Sort</label>
              <select id="sort-notes" value={sort} onChange={(event) => setSort(event.target.value as SortMode)} data-testid="select-sort-notes" className="cursor-pointer bg-transparent py-1 font-semibold outline-none"><option value="recent">Newest</option><option value="popular">Most liked</option></select>
            </div>
          </div>
        </div>
        <div className={`${filtersOpen ? 'animate-filter-panel block' : 'hidden'} mb-7 lg:block`}>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Note categories">
            {categories.map((item) => <button key={item.value} type="button" data-testid={`filter-category-${item.value}`} onClick={() => setCategory(item.value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${category === item.value ? 'bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(35_60%_33%/.22)]' : 'border border-border bg-card text-muted-foreground hover:border-[hsl(var(--accent))] hover:text-foreground'}`}>{item.label}</button>)}
          </div>
        </div>
        {notesQuery.isLoading ? <LoadingCard /> : notesQuery.isError ? <div className="rounded-2xl border border-[hsl(var(--destructive)/.35)] bg-[hsl(var(--destructive)/.06)] p-10 text-center"><h2 className="font-display text-2xl">The shelf is taking a breather.</h2><p className="mt-2 text-sm text-muted-foreground">We couldn't load the notes right now.</p><button type="button" data-testid="button-retry-notes" onClick={() => notesQuery.refetch()} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Try again</button></div> : notes.length === 0 ? <div key={resultsKey} className="animate-results-enter"><EmptyState hasFilters={hasFilters} onReset={() => { setSearch(''); setCategory('all'); }} /></div> : <div key={resultsKey} className="animate-results-enter grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{notes.map((note, index) => <NoteCard key={note.id} note={note} index={index} />)}</div>}
      </section>
    </div>
  );
}