import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
// @ts-ignore - No types available for torrent-search-api
import TorrentSearchApi from "torrent-search-api";
import { 
  searchTorrentSchema, 
  addTorrentSchema, 
  batchAddTorrentsSchema,
  type SearchResults 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const TORBOX_API_KEY = process.env.TORBOX_API_KEY || process.env.TORBOX_API_KEY_ENV_VAR || "";
  
  if (!TORBOX_API_KEY) {
    console.warn("Warning: TORBOX_API_KEY not found in environment variables");
  }

  // Initialize torrent search API as fallback
  TorrentSearchApi.enableProvider('1337x');
  TorrentSearchApi.enableProvider('ThePirateBay');
  TorrentSearchApi.enableProvider('Rarbg');

  // Search torrents with fallback system
  app.post("/api/search", async (req, res) => {
    try {
      const searchParams = searchTorrentSchema.parse(req.body);
      
      console.log("Search request:", searchParams);

      // Try alternative torrent search API directly
      try {
        const category = searchParams.category && searchParams.category !== "all" 
          ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1) 
          : "All";
        
        console.log("Searching with torrent-search-api for:", searchParams.search, "category:", category);
        
        const searchResults = await TorrentSearchApi.search(searchParams.search, category, 50);
        
        console.log("Found", searchResults.length, "results from torrent-search-api");

        // Convert to our expected format
        const formattedResults = searchResults.map((torrent: any, index: number) => ({
          id: torrent.magnet || `${torrent.title}-${index}`,
          title: torrent.title || "Unknown Title",
          category: category,
          categoryId: [1000000], // Default category ID
          bytes: torrent.size ? parseInt(torrent.size.replace(/[^0-9]/g, '')) * 1024 * 1024 : 0, // Rough conversion
          seeders: parseInt(torrent.seeds) || 0,
          peers: parseInt(torrent.peers) || 0,
          date: torrent.time || new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          magnetUrl: torrent.magnet || "",
          hash: torrent.magnet ? torrent.magnet.match(/btih:([a-fA-F0-9]{40})/)?.[1] || "" : "",
          cachedOrigin: torrent.provider || "Multiple Sources",
          details: torrent.desc || ""
        }));

        // Apply filters
        let filteredResults = formattedResults;
        
        if (searchParams.minSeeders && searchParams.minSeeders > 0) {
          filteredResults = filteredResults.filter((torrent: any) => torrent.seeders >= searchParams.minSeeders!);
        }

        // Apply sorting
        if (searchParams.sortBy === "seeders") {
          filteredResults.sort((a: any, b: any) => b.seeders - a.seeders);
        } else if (searchParams.sortBy === "size") {
          filteredResults.sort((a: any, b: any) => b.bytes - a.bytes);
        } else {
          // Default to date sorting (newest first)
          filteredResults.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        const results: SearchResults = {
          hits: filteredResults,
          total: { value: filteredResults.length, relation: "eq" },
          maxScore: null
        };

        console.log("Returning", results.hits.length, "filtered results");
        res.json(results);

      } catch (fallbackError) {
        console.error("Fallback search error:", fallbackError);
        res.status(500).json({ 
          message: "Search services temporarily unavailable. Please try again later.",
          error: "Both primary and fallback search failed"
        });
      }

    } catch (error) {
      console.error("Search validation error:", error);
      res.status(400).json({ message: "Invalid search parameters." });
    }
  });

  // Get recent torrents (browse mode)
  app.get("/api/browse", async (req, res) => {
    try {
      const response = await axios.get("https://knaben.org/api/v1/", {
        headers: {
          "User-Agent": "TorBox-Search-App/1.0",
        },
        timeout: 10000,
      });

      res.json(response.data);
    } catch (error) {
      console.error("Browse error:", error);
      res.status(500).json({ message: "Failed to fetch recent torrents. Please try again later." });
    }
  });

  // Add single torrent to TorBox
  app.post("/api/torbox/add", async (req, res) => {
    try {
      const { magnetUrl, apiKey } = req.body;
      const userApiKey = apiKey || TORBOX_API_KEY;
      
      if (!userApiKey) {
        return res.status(400).json({ message: "TorBox API key is required. Please configure it in settings." });
      }

      const parsedData = addTorrentSchema.parse({ magnetUrl });

      // Try form data instead of JSON
      const formData = new URLSearchParams();
      formData.append('magnet', magnetUrl);

      const response = await axios.post(
        "https://api.torbox.app/v1/api/torrents/createtorrent",
        formData,
        {
          headers: {
            "Authorization": `Bearer ${userApiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 15000,
        }
      );

      if (response.status === 200) {
        res.json({ success: true, message: "Torrent successfully added to TorBox" });
      } else {
        res.status(400).json({ message: "Failed to add torrent to TorBox" });
      }
    } catch (error) {
      console.error("TorBox add error:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          res.status(401).json({ message: "Invalid TorBox API key. Please check configuration." });
        } else if (error.response?.status === 429) {
          res.status(429).json({ message: "TorBox rate limit exceeded. Please try again later." });
        } else if (error.code === "ECONNABORTED") {
          res.status(408).json({ message: "Request to TorBox timed out. Please try again." });
        } else {
          res.status(500).json({ message: "TorBox service temporarily unavailable. Please try again later." });
        }
      } else {
        res.status(400).json({ message: "Invalid magnet URL provided." });
      }
    }
  });

  // Add multiple torrents to TorBox (batch)
  app.post("/api/torbox/batch-add", async (req, res) => {
    try {
      const { magnetUrls, apiKey } = req.body;
      const userApiKey = apiKey || TORBOX_API_KEY;
      
      if (!userApiKey) {
        return res.status(400).json({ message: "TorBox API key is required. Please configure it in settings." });
      }

      const parsedData = batchAddTorrentsSchema.parse({ magnetUrls });
      const { magnetUrls: validatedMagnetUrls } = parsedData;

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Process torrents one by one to avoid overwhelming the API
      for (const magnetUrl of validatedMagnetUrls) {
        try {
          // Try form data instead of JSON
          const formData = new URLSearchParams();
          formData.append('magnet', magnetUrl);

          const response = await axios.post(
            "https://api.torbox.app/v1/api/torrents/createtorrent", // Use correct endpoint
            formData,
            {
              headers: {
                "Authorization": `Bearer ${userApiKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              timeout: 10000,
            }
          );

          if (response.status === 200) {
            successCount++;
          } else {
            failedCount++;
            errors.push(`Failed to add torrent: ${magnetUrl.substring(0, 50)}...`);
          }
        } catch (error) {
          failedCount++;
          errors.push(`Error adding torrent: ${magnetUrl.substring(0, 50)}...`);
        }

        // Add small delay between requests to be respectful to the API
        if (validatedMagnetUrls.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      res.json({
        success: successCount > 0,
        successCount,
        failedCount,
        totalCount: validatedMagnetUrls.length,
        message: `Successfully added ${successCount} of ${validatedMagnetUrls.length} torrents to TorBox`,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("TorBox batch add error:", error);
      res.status(400).json({ message: "Invalid request parameters." });
    }
  });

  // Check TorBox API status
  app.get("/api/torbox/status", async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] || TORBOX_API_KEY;
      
      if (!apiKey) {
        return res.json({ connected: false, message: "API key not configured" });
      }

      // Test the API key by making a simple request to TorBox
      try {
        await axios.get("https://api.torbox.app/v1/api/user/me", {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
          },
          timeout: 5000,
        });
        res.json({ connected: true, message: "API key is valid" });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          res.json({ connected: false, message: "Invalid API key" });
        } else {
          res.json({ connected: false, message: "Unable to verify API key" });
        }
      }
    } catch (error) {
      res.json({ connected: false, message: "Connection failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
