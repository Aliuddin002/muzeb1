"use client";
import type { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Play, Pause, MinusCircle, ListPlus } from "lucide-react";
import Image from "next/image";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { AddToPlaylistMenu } from "@/components/playlist/AddToPlaylistMenu";

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { playSong, togglePlayPause, currentSong, isPlaying } = useAudioPlayer();
  const { favorites, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites();
  const { user } = useAuth();

  const isCurrentSong = currentSong?.id === song.id;
  const isFavorite = favorites.some(fav => fav.id === song.id);

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  const handleFavoriteClick = () => {
    if (!user) return;
    if (isFavorite) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
  };

  return (
    <Card className="group w-60 flex-shrink-0 overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="p-0 relative">
        <div className="aspect-square w-full relative">
         <Image
            src={song.albumArt || `https://picsum.photos/seed/${song.id}/300/300`}
            alt={song.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            data-ai-hint="album cover music"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayClick}
              className="h-16 w-16 rounded-full bg-accent/80 text-accent-foreground hover:bg-accent"
              aria-label={isCurrentSong && isPlaying ? "Pause song" : "Play song"}
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold truncate text-primary group-hover:text-accent transition-colors">
          {song.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{song.genre}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFavoriteClick}
          disabled={favoritesLoading || !user}
          className={`flex-1 ${isFavorite ? "border-destructive text-destructive hover:bg-destructive/10" : "border-accent text-accent hover:bg-accent/10"}`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? <MinusCircle className="mr-2 h-4 w-4" /> : <Heart className="mr-2 h-4 w-4" />}
          {isFavorite ? "Favorited" : "Favorite"}
        </Button>
         {user && (
            <AddToPlaylistMenu song={song}>
                <Button variant="outline" size="icon" aria-label="Add to playlist">
                    <ListPlus className="h-5 w-5" />
                </Button>
            </AddToPlaylistMenu>
        )}
      </CardFooter>
    </Card>
  );
}
