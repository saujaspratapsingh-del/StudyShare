import type { Note } from '@workspace/api-client-react';

export interface DownloadedNote {
  note: Note;
  downloadedAt: string;
}

const storageKey = 'studyshare-downloaded-notes';
const changeEvent = 'studyshare-downloaded-notes-change';
const categories = new Set<Note['category']>(['story', 'poem', 'chapter', 'other']);

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object') return false;
  const note = value as Partial<Note>;
  return (
    Number.isInteger(note.id) &&
    typeof note.title === 'string' &&
    categories.has(note.category as Note['category']) &&
    typeof note.subject === 'string' &&
    typeof note.content === 'string' &&
    typeof note.authorName === 'string' &&
    typeof note.authorInitials === 'string' &&
    typeof note.likes === 'number' &&
    typeof note.createdAt === 'string'
  );
}

function readDownloads(): DownloadedNote[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is DownloadedNote => {
      if (!value || typeof value !== 'object') return false;
      const downloaded = value as Partial<DownloadedNote>;
      return isNote(downloaded.note) && typeof downloaded.downloadedAt === 'string';
    });
  } catch {
    return [];
  }
}

function notifyChange() {
  window.dispatchEvent(new Event(changeEvent));
}

export function getDownloadedNotes(): DownloadedNote[] {
  return readDownloads();
}

export function rememberDownloadedNote(note: Note): void {
  if (typeof window === 'undefined') return;

  const downloads = readDownloads().filter((download) => download.note.id !== note.id);
  window.localStorage.setItem(
    storageKey,
    JSON.stringify([{ note, downloadedAt: new Date().toISOString() }, ...downloads]),
  );
  notifyChange();
}

export function subscribeToDownloadedNotes(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) callback();
  };
  const handleLocalChange = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(changeEvent, handleLocalChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(changeEvent, handleLocalChange);
  };
}