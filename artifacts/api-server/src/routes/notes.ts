import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import {
  CreateNoteBody,
  GetNoteParams,
  GetNoteResponse,
  LikeNoteParams,
  LikeNoteResponse,
  ListNotesQueryParams,
  ListNotesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "ST";
}

router.get("/notes", async (req, res): Promise<void> => {
  const parsedQuery = ListNotesQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const { search, category, sort } = parsedQuery.data;
  const filters = [];

  if (category && category !== "all") {
    filters.push(eq(notesTable.category, category));
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    filters.push(
      or(
        ilike(notesTable.title, term),
        ilike(notesTable.subject, term),
        ilike(notesTable.content, term),
        ilike(notesTable.authorName, term),
      ),
    );
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(sort === "popular" ? desc(notesTable.likes) : desc(notesTable.createdAt));

  res.json(ListNotesResponse.parse(notes));
});

router.post("/notes", async (req, res): Promise<void> => {
  const parsedBody = CreateNoteBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [note] = await db
    .insert(notesTable)
    .values({
      ...parsedBody.data,
      authorInitials: getInitials(parsedBody.data.authorName),
    })
    .returning();

  res.status(201).json(GetNoteResponse.parse(note));
});

router.get("/notes/:id", async (req, res): Promise<void> => {
  const parsedParams = GetNoteParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, parsedParams.data.id));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(GetNoteResponse.parse(note));
});

router.post("/notes/:id/like", async (req, res): Promise<void> => {
  const parsedParams = LikeNoteParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [note] = await db
    .update(notesTable)
    .set({ likes: sql<number>`${notesTable.likes} + 1` })
    .where(eq(notesTable.id, parsedParams.data.id))
    .returning({ likes: notesTable.likes });

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(LikeNoteResponse.parse(note));
});

export default router;