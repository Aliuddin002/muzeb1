
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SongList } from "@/components/song/SongList";
import { getSongs, getSongById } from "@/services/fma";
import type { Song } from "@/types";
import { Loader2, SearchX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const songIdsParam = searchParams.get("ids");

  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      setError(null);
      setSearchResults([]);
      
      try {
        if (songIdsParam) {
           const songIds = JSON.parse(decodeURIComponent(songIdsParam)) as string[];
           const songPromises = songIds.map(id => getSongById(id));
           const songs = (await Promise.all(songPromises)).filter((s): s is Song => s !== undefined);
           setSearchResults(songs);
        } else if (query) {
          const songs = await getSongs({ query });
          setSearchResults(songs);
        }
      } catch (err: any) {
        setError(err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (query || songIdsParam) {
        fetchResults();
    } else {
        setIsLoading(false);
    }
  }, [query, songIdsParam]);

  let title = "Search Results";
  if (query === 'hum-based-search') title = "Songs Based on Your Hum";
  else if (query) title = `Results for "${query}"`;


  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      {error && (
        <Alert variant="destructive">
          <SearchX className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not perform search: {error.message}
          </AlertDescription>
        </Alert>
      )}
      {!error && searchResults.length === 0 && (
        <Alert>
          <SearchX className="h-4 w-4" />
          <AlertTitle>No Results Found</AlertTitle>
          <AlertDescription>
            {query ? `No songs found matching "${query}". Try a different search term or hum a tune.` : "Please enter a search term or try humming a tune."}
          </AlertDescription>
        </Alert>
      )}
      {!error && searchResults.length > 0 && (
         <SongList songs={searchResults} isLoading={false} />
      )}
    </section>
  );
}
