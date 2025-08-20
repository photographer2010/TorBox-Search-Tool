import { type SearchTorrent, type SearchResults, type Torrent } from "@shared/schema";

// Storage interface for any future database needs
export interface IStorage {
  // For now, we don't need persistent storage as we're just proxying API calls
  // This could be extended later for caching search results or storing user preferences
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for now
  }
}

export const storage = new MemStorage();
