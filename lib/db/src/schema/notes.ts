import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorInitials: text("author_initials").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({
  id: true,
  authorInitials: true,
  likes: true,
  createdAt: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;