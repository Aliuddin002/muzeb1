
"use client";

import { useEffect, useMemo } from "react";
import { SongList } from "@/components/song/SongList";
import { RecommendationSection } from "@/components/recommendations/RecommendationSection";
import { getSongs } from "@/services/fma";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSongRecommendations } from "@/hooks/useSongRecommendations";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/hooks/useHistory";

export default function HomePage() {
  const { user } = useAuth();
  
  const { 
    data, 
    error: songsError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading: isLoadingSongs 
  } = useInfiniteQuery({
    queryKey: ["discoverSongs"],
    queryFn: ({ pageParam }) => getSongs({ limit: 10, startAfter: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
  });

  const allSongs = useMemo(() => data?.pages.flatMap(page => page.songs) ?? [], [data]);

  const { history: listenedSongs } = useHistory();
  const { 
    recommendations, 
    isLoading: isLoadingRecs, 
    error: errorRecs,
    fetchRecommendations 
  } = useSongRecommendations();

  useEffect(() => {
    if (user && listenedSongs.length > 0) {
      fetchRecommendations({
        source: 'history',
        songs: listenedSongs,
        top_k: 10
      });
    }
  }, [listenedSongs, fetchRecommendations, user]);


  if (isLoadingSongs && !data) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-6 text-primary">Discover Music</h2>
        <SongList 
          songs={allSongs || []} 
          isLoading={isLoadingSongs && !data} // Show skeleton only on initial load
          error={songsError as Error | null} 
          layout="slider" 
          onEndReached={fetchNextPage}
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
        />
      </section>
      
      {user && listenedSongs.length > 0 && (
        <RecommendationSection 
          title="Because You Listened To..."
          recommendations={recommendations}
          isLoading={isLoadingRecs}
          error={errorRecs}
          layout="slider"
        />
      )}
       {user && listenedSongs.length === 0 && !isLoadingRecs && (
         <RecommendationSection 
          title="Recommendations For You"
          recommendations={[]} // Initially no recommendations until songs are listened
          isLoading={false}
          error={null}
          emptyMessage="Listen to some songs to get personalized recommendations!"
        />
       )}
    </div>
  );
}
