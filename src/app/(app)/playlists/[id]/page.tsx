"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlaylists } from "@/hooks/usePlaylists";
import type { Playlist, Song } from "@/types";
import { Loader2, ListMusic, Trash2, Music, ArrowLeft, Frown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  const { getPlaylist, removeSongFromPlaylist, deletePlaylist, playlists } = usePlaylists();
  const { playSong, currentSong } = useAudioPlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundPlaylist = playlists.find(p => p.id === playlistId);
    if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        setIsLoading(false);
    } else if (playlistId) {
      setIsLoading(true);
      getPlaylist(playlistId).then((p) => {
        setPlaylist(p);
        setIsLoading(false);
      });
    }
  }, [playlistId, getPlaylist, playlists]);
  
  const handleDeletePlaylist = async () => {
    await deletePlaylist(playlistId);
    router.push('/playlists');
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center">
        <Frown className="mx-auto h-24 w-24 text-destructive" />
        <h2 className="mt-4 text-2xl font-semibold">Playlist Not Found</h2>
        <p className="mt-2 text-muted-foreground">This playlist may have been deleted or never existed.</p>
        <Button onClick={() => router.push('/playlists')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Playlists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4"/> Back
      </Button>

      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="flex-shrink-0 w-full md:w-64">
             <div className="aspect-square w-full rounded-lg bg-primary/10 flex items-center justify-center shadow-lg">
                <ListMusic className="h-32 w-32 text-primary" />
             </div>
             <h1 className="text-3xl font-bold mt-4 truncate">{playlist.name}</h1>
             <p className="text-muted-foreground">{playlist.songs?.length || 0} songs</p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full mt-4">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Playlist
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the "{playlist.name}" playlist. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePlaylist}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <div className="flex-1 w-full">
          {playlist.songs && playlist.songs.length > 0 ? (
            <Card>
                <CardContent className="p-2">
                    <div className="space-y-2">
                    {playlist.songs.map((song, index) => (
                        <div key={song.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors group">
                            <button onClick={() => playSong(song)} className="flex items-center gap-4 flex-1 text-left">
                                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                                <Image 
                                    src={song.albumArt || `https://picsum.photos/seed/${song.id}/100/100`}
                                    alt={song.title}
                                    width={40}
                                    height={40}
                                    className="rounded"
                                    data-ai-hint="album cover"
                                />
                                <div className="flex-1">
                                    <p className={`font-semibold ${currentSong?.id === song.id ? 'text-primary' : ''}`}>{song.title}</p>
                                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                                </div>
                                <p className="text-sm text-muted-foreground hidden md:block">{song.genre}</p>
                            </button>
                            <Button variant="ghost" size="icon" onClick={() => removeSongFromPlaylist(playlistId, song.id)} className="opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>
          ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Music className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">This Playlist is Empty</h3>
                <p className="mt-1 text-muted-foreground">Add some songs to get started!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
