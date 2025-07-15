"use client";

import { usePlaylists } from "@/hooks/usePlaylists";
import { CreatePlaylistDialog } from "@/components/playlist/CreatePlaylistDialog";
import { ListMusic, Plus, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function PlaylistsPage() {
  const { user } = useAuth();
  const { playlists, isLoading } = usePlaylists();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <Frown className="h-24 w-24 text-primary mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Login to See Your Playlists</h2>
        <p className="text-muted-foreground mb-6">
          Your playlists will appear here once you log in.
        </p>
        <Link href="/login">
          <Button size="lg">Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ListMusic className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Your Playlists</h1>
        </div>
        <CreatePlaylistDialog>
          <Button>
            <Plus className="mr-2 h-5 w-5" />
            New Playlist
          </Button>
        </CreatePlaylistDialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Alert>
            <ListMusic className="h-4 w-4" />
            <AlertTitle>No Playlists Yet</AlertTitle>
            <AlertDescription>
              Click "New Playlist" to create your first one!
            </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
