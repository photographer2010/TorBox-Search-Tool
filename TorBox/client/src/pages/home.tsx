import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TorrentSearch from "@/components/torrent-search";
import SearchResults from "@/components/search-results";
import SettingsModal from "@/components/settings-modal";
import { type SearchState, type ApiStatus } from "@/lib/types";

export default function Home() {
  const [searchState, setSearchState] = useState<SearchState>({
    search: "",
    category: "",
    searchType: "100%",
    sortBy: "date",
  });
  const [showSettings, setShowSettings] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Check TorBox API status
  const { data: apiStatus } = useQuery<ApiStatus>({
    queryKey: ["/api/torbox/status"],
    queryFn: async () => {
      const apiKey = localStorage.getItem("torbox_api_key");
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
      const response = await fetch("/api/torbox/status", { headers });
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const handleSearch = (newSearchState: SearchState) => {
    setSearchState(newSearchState);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TorBox Search</h1>
                <p className="text-sm text-gray-500">Torrent Search & Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="text-sm text-gray-600">
                <span className="hidden sm:inline">API Status: </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  apiStatus?.connected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    apiStatus?.connected ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  {apiStatus?.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TorrentSearch onSearch={handleSearch} />
        {hasSearched && <SearchResults searchState={searchState} />}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}
