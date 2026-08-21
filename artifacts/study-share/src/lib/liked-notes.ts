const storageKey = 'studyshare-liked-note-ids';
const changeEvent = 'studyshare-liked-notes-change';

function readIds(): number[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((value): value is number => Number.isInteger(value))
      : [];
  } catch {
    return [];
  }
}

function notifyChange() {
  window.dispatchEvent(new Event(changeEvent));
}

export function getLikedNoteIds(): number[] {
  return readIds();
}

export function hasLikedNote(id: number): boolean {
  return readIds().includes(id);
}

export function rememberLikedNote(id: number): void {
  if (typeof window === 'undefined') return;

  const ids = readIds();
  if (ids.includes(id)) return;

  window.localStorage.setItem(storageKey, JSON.stringify([...ids, id]));
  notifyChange();
}

export function subscribeToLikedNotes(callback: () => void): () => void {
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