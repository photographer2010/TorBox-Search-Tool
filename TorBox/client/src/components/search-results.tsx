import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type SearchState, type TorrentSelection } from "@/lib/types";
import { type SearchResults, type Torrent } from "@shared/schema";

interface SearchResultsProps {
  searchState: SearchState;
}

export default function SearchResults({ searchState }: SearchResultsProps) {
  const [selectedTorrents, setSelectedTorrents] = useState<TorrentSelection>({});
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;
  const { toast } = useToast();

  // Search query
  const { data: searchResults, isLoading, error } = useQuery<SearchResults>({
    queryKey: ["/api/search", searchState],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/search", searchState);
      return response.json();
    },
    enabled: !!searchState.search,
    retry: 1,
  });

  // Add single torrent mutation
  const addSingleMutation = useMutation({
    mutationFn: async (magnetUrl: string) => {
      const apiKey = localStorage.getItem("torbox_api_key");
      const response = await apiRequest("POST", "/api/torbox/add", { magnetUrl, apiKey });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Torrent successfully added to TorBox",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add torrent to TorBox",
        variant: "destructive",
      });
    },
  });

  // Add multiple torrents mutation
  const addBatchMutation = useMutation({
    mutationFn: async (magnetUrls: string[]) => {
      const apiKey = localStorage.getItem("torbox_api_key");
      const response = await apiRequest("POST", "/api/torbox/batch-add", { magnetUrls, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Add Complete",
        description: `Successfully added ${data.successCount} of ${data.totalCount} torrents to TorBox`,
      });
      setSelectedTorrents({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add torrents to TorBox",
        variant: "destructive",
      });
    },
  });

  const paginatedResults = useMemo(() => {
    if (!searchResults?.hits) return [];
    const startIndex = (currentPage - 1) * resultsPerPage;
    return searchResults.hits.slice(startIndex, startIndex + resultsPerPage);
  }, [searchResults, currentPage]);

  const totalPages = useMemo(() => {
    if (!searchResults?.hits) return 0;
    return Math.ceil(searchResults.hits.length / resultsPerPage);
  }, [searchResults]);

  const selectedCount = Object.values(selectedTorrents).filter(Boolean).length;
  const allSelected = paginatedResults.length > 0 && paginatedResults.every(torrent => selectedTorrents[torrent.id]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = { ...selectedTorrents };
    paginatedResults.forEach(torrent => {
      newSelection[torrent.id] = checked;
    });
    setSelectedTorrents(newSelection);
  };

  const handleSelectTorrent = (torrentId: string, checked: boolean) => {
    setSelectedTorrents(prev => ({
      ...prev,
      [torrentId]: checked,
    }));
  };

  const handleAddSelected = () => {
    if (!searchResults?.hits) return;
    
    const selectedMagnetUrls = searchResults.hits
      .filter(torrent => selectedTorrents[torrent.id])
      .map(torrent => torrent.magnetUrl);
    
    if (selectedMagnetUrls.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one torrent to add",
        variant: "destructive",
      });
      return;
    }

    addBatchMutation.mutate(selectedMagnetUrls);
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string): string => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('movie')) return 'bg-purple-100 text-purple-800';
    if (categoryLower.includes('tv') || categoryLower.includes('series')) return 'bg-blue-100 text-blue-800';
    if (categoryLower.includes('music') || categoryLower.includes('audio')) return 'bg-pink-100 text-pink-800';
    if (categoryLower.includes('game')) return 'bg-green-100 text-green-800';
    if (categoryLower.includes('software') || categoryLower.includes('application')) return 'bg-cyan-100 text-cyan-800';
    if (categoryLower.includes('anime')) return 'bg-orange-100 text-orange-800';
    if (categoryLower.includes('book')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Searching...</h3>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Failed</h3>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : "Failed to search torrents. Please try again."}
        </p>
      </Card>
    );
  }

  if (!searchResults?.hits || searchResults.hits.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600">
          No torrents found for "{searchState.search}". Try adjusting your search terms or filters.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Results Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
            <Badge variant="secondary">
              {searchResults.total.value.toLocaleString()} results
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            {/* Batch Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedCount} selected
                </span>
                <Button 
                  onClick={handleAddSelected}
                  disabled={addBatchMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  size="sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Selected to TorBox
                </Button>
              </div>
            )}
            
            {/* Select All */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Select</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Seeds</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Peers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedResults.map((torrent: Torrent) => (
              <tr key={torrent.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Checkbox 
                    checked={selectedTorrents[torrent.id] || false}
                    onCheckedChange={(checked) => handleSelectTorrent(torrent.id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {torrent.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {torrent.cachedOrigin}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={getCategoryColor(torrent.category)}>
                    {torrent.category}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatBytes(torrent.bytes)}
                </td>
                <td className="px-6 py-4">
                  <Badge className="bg-green-100 text-green-800">
                    {torrent.seeders}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className="bg-orange-100 text-orange-800">
                    {torrent.peers}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(torrent.date)}
                </td>
                <td className="px-6 py-4">
                  <Button 
                    onClick={() => addSingleMutation.mutate(torrent.magnetUrl)}
                    disabled={addSingleMutation.isPending}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{(currentPage - 1) * resultsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * resultsPerPage, searchResults.total.value)}
              </span>{' '}
              of <span className="font-medium">{searchResults.total.value.toLocaleString()}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : 
                    currentPage >= totalPages - 2 ? totalPages - 4 + i : 
                    currentPage - 2 + i;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-sm text-gray-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
