"use client";

import { useEffect } from "react";
import { SongList } from "@/components/song/SongList";
import { RecommendationSection } from "@/components/recommendations/RecommendationSection";
import { useFavorites } from "@/hooks/useFavorites";
import { useSongRecommendations } from "@/hooks/useSongRecommendations";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, HeartCrack } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isLoading: isLoadingFavorites } = useFavorites();
  const { 
    recommendations, 
    isLoading: isLoadingRecs, 
    error: errorRecs,
    fetchRecommendations 
  } = useSongRecommendations();
  
  useEffect(() => {
    if (user && !isLoadingFavorites && favorites.length > 0) {
        fetchRecommendations({
            source: 'favorites',
            songs: favorites,
        });
    } else if (favorites.length === 0) {
        fetchRecommendations({ source: 'favorites', songs: [] }); // Clear recommendations
    }
  }, [favorites, user, fetchRecommendations, isLoadingFavorites]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <HeartCrack className="h-24 w-24 text-primary mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Login to See Your Favorites</h2>
        <p className="text-muted-foreground mb-6">
          Your favorite songs and personalized recommendations will appear here once you log in.
        </p>
        <Link href="/login">
          <Button size="lg">Login</Button>
        </Link>
      </div>
    );
  }
  
  if (isLoadingFavorites) {
     return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-6 text-primary">Your Favorite Songs</h2>
        {favorites.length === 0 ? (
           <Alert>
            <HeartCrack className="h-4 w-4" />
            <AlertTitle>No Favorites Yet</AlertTitle>
            <AlertDescription>
              Start exploring and add songs to your favorites! They will appear here.
            </AlertDescription>
          </Alert>
        ) : (
          <SongList songs={favorites} isLoading={isLoadingFavorites} />
        )}
      </section>
      
      {favorites.length > 0 && (
        <RecommendationSection 
          title="Recommended For You (Based on Favorites)"
          recommendations={recommendations}
          isLoading={isLoadingRecs}
          error={errorRecs}
        />
      )}
    </div>
  );
}
