import { z } from "zod";

// Torrent search schemas
export const searchTorrentSchema = z.object({
  search: z.string().min(1, "Search query is required"),
  category: z.string().optional(),
  searchType: z.enum(["100%", "fuzzy"]).default("100%"),
  searchField: z.string().default("title"),
  minSeeders: z.number().min(0).optional(),
  sortBy: z.enum(["date", "seeders", "size"]).default("date"),
});

export const torrentSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  categoryId: z.array(z.number()),
  bytes: z.number(),
  seeders: z.number(),
  peers: z.number(),
  date: z.string(),
  lastSeen: z.string(),
  magnetUrl: z.string(),
  hash: z.string(),
  cachedOrigin: z.string(),
  details: z.string().optional(),
});

export const searchResultsSchema = z.object({
  total: z.object({
    value: z.number(),
    relation: z.string(),
  }),
  hits: z.array(torrentSchema),
  maxScore: z.number().nullable(),
});

export const addTorrentSchema = z.object({
  magnetUrl: z.string().min(1, "Magnet URL is required"),
});

export const batchAddTorrentsSchema = z.object({
  magnetUrls: z.array(z.string()).min(1, "At least one magnet URL is required"),
});

export type SearchTorrent = z.infer<typeof searchTorrentSchema>;
export type Torrent = z.infer<typeof torrentSchema>;
export type SearchResults = z.infer<typeof searchResultsSchema>;
export type AddTorrent = z.infer<typeof addTorrentSchema>;
export type BatchAddTorrents = z.infer<typeof batchAddTorrentsSchema>;
