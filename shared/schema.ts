import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// File schema
export const files = pgTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull(),
  path: text("path"),
  userId: text("user_id"), // For potential multi-user support in the future
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Editor settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  theme: text("theme").notNull().default("dark"),
  fontSize: integer("font_size").notNull().default(14),
  tabSize: integer("tab_size").notNull().default(2),
  wordWrap: boolean("word_wrap").notNull().default(false),
  autoSave: boolean("auto_save").notNull().default(false),
  keybindings: jsonb("keybindings").default({})
});

// Insert schemas
export const insertFileSchema = createInsertSchema(files).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().optional(), // Allow auto-generation
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Types for the application
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
