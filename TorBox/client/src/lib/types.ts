export interface TorrentSelection {
  [key: string]: boolean;
}

export interface SearchState {
  search: string;
  category: string;
  searchType: "100%" | "fuzzy";
  minSeeders?: number;
  sortBy: "date" | "seeders" | "size";
}

export interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
  visible: boolean;
}

export interface ApiStatus {
  connected: boolean;
  message: string;
}
