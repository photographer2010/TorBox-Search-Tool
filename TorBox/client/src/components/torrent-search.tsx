import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Search } from "lucide-react";
import { type SearchState } from "@/lib/types";

interface TorrentSearchProps {
  onSearch: (searchState: SearchState) => void;
}

export default function TorrentSearch({ onSearch }: TorrentSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [searchType, setSearchType] = useState<"100%" | "fuzzy">("100%");
  const [minSeeders, setMinSeeders] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"date" | "seeders" | "size">("date");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch({
      search: query.trim(),
      category,
      searchType,
      minSeeders,
      sortBy,
    });
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <Search className="text-blue-500 w-5 h-5 mr-3" />
          <h2 className="text-lg font-semibold text-gray-900">Search Torrents</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-6">
              <Label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </Label>
              <Input
                id="search-query"
                type="text"
                placeholder="Enter torrent name, movie title, etc..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            {/* Category Filter */}
            <div className="lg:col-span-3">
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="movies">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Button */}
            <div className="lg:col-span-3 flex items-end">
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          {/* Advanced Options */}
          <div className="border-t border-gray-200 pt-4">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Advanced Options</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            
            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Search Type</Label>
                  <Select value={searchType} onValueChange={(value: "100%" | "fuzzy") => setSearchType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100%">Exact Match</SelectItem>
                      <SelectItem value="fuzzy">Fuzzy Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Min Seeders</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min="0"
                    value={minSeeders || ""}
                    onChange={(e) => setMinSeeders(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: "date" | "seeders" | "size") => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Added</SelectItem>
                      <SelectItem value="seeders">Seeders</SelectItem>
                      <SelectItem value="size">File Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
