"use client";

import { usePlaylists } from "@/hooks/usePlaylists";
import type { Song } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListMusic, PlusCircle, Loader2 } from "lucide-react";
import { CreatePlaylistDialog } from "@/components/playlist/CreatePlaylistDialog";

interface AddToPlaylistMenuProps {
  song: Song;
  children: React.ReactNode;
}

export function AddToPlaylistMenu({ song, children }: AddToPlaylistMenuProps) {
  const { playlists, isLoading, addSongToPlaylist } = usePlaylists();
  
  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
            <DropdownMenuItem disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Loading...
            </DropdownMenuItem>
        ) : playlists.length > 0 ? (
            playlists.map((playlist) => (
                <DropdownMenuItem key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)}>
                    <ListMusic className="mr-2 h-4 w-4"/>
                    <span>{playlist.name}</span>
                </DropdownMenuItem>
            ))
        ) : (
            <DropdownMenuItem disabled>No playlists found</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
         <CreatePlaylistDialog>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>New Playlist</span>
            </DropdownMenuItem>
         </CreatePlaylistDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
