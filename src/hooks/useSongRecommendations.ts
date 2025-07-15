"use client";

import { useState, useCallback } from "react";
import type { Song } from "@/types";
import { getRecommendations } from "@/services/recommendations";
import { useToast } from "./use-toast";

interface FetchRecommendationsInput {
    songs: Song[];
    source: 'history' | 'favorites';
    top_k?: number;
}

export function useSongRecommendations() {
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async (input: FetchRecommendationsInput) => {
    setIsLoading(true);
    setError(null);
    
    // If there are no songs, clear recommendations and stop.
    if (!input.songs || input.songs.length === 0) {
        setRecommendations([]);
        setIsLoading(false);
        return;
    }

    try {
      const results = await getRecommendations(input);
      setRecommendations(results);
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      setError(err);
      toast({
        title: "Recommendation Error",
        description: err.message || "Could not fetch recommendations.",
        variant: "destructive",
      });
      setRecommendations([]); // Clear recommendations on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  return { 
    recommendations, 
    isLoading, 
    error, 
    fetchRecommendations, 
  };
}
