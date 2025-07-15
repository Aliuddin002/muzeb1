"use client";

import { useCallback, useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc
} from "firebase/firestore";

import type { Playlist, Song } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { useToast } from "./use-toast";


export function usePlaylists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all playlists for the user
  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const playlistsColRef = collection(db, "users", user.uid, "playlists");
    const q = query(playlistsColRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userPlaylists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Playlist));
      setPlaylists(userPlaylists);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching playlists:", error);
      toast({ title: "Error", description: "Could not fetch playlists.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  // Get a single playlist (not real-time)
  const getPlaylist = useCallback(async (playlistId: string): Promise<Playlist | null> => {
    if (!user) return null;
    try {
      const playlistRef = doc(db, "users", user.uid, "playlists", playlistId);
      const docSnap = await getDoc(playlistRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Playlist;
      }
      return null;
    } catch (error) {
      console.error("Error fetching playlist:", error);
      toast({ title: "Error", description: "Could not fetch the playlist.", variant: "destructive" });
      return null;
    }
  }, [user, toast]);


  const createPlaylist = async (name: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to create a playlist.", variant: "destructive" });
      return;
    }
    try {
      const playlistsColRef = collection(db, "users", user.uid, "playlists");
      await addDoc(playlistsColRef, {
        name,
        createdAt: serverTimestamp(),
        songs: [],
      });
      toast({ title: "Playlist Created", description: `"${name}" has been created.` });
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({ title: "Error", description: "Could not create the playlist.", variant: "destructive" });
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;
    try {
      const playlistRef = doc(db, "users", user.uid, "playlists", playlistId);
      await deleteDoc(playlistRef);
      toast({ title: "Playlist Deleted" });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({ title: "Error", description: "Could not delete the playlist.", variant: "destructive" });
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    if (!user) return;
    try {
      const playlistRef = doc(db, "users", user.uid, "playlists", playlistId);
      await updateDoc(playlistRef, {
        songs: arrayUnion(song),
      });
      toast({ title: "Song Added", description: `${song.title} added to playlist.` });
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      toast({ title: "Error", description: "Could not add the song.", variant: "destructive" });
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    if (!user) return;
    try {
        const playlistRef = doc(db, "users", user.uid, "playlists", playlistId);
        const docSnap = await getDoc(playlistRef);
        if (docSnap.exists()) {
            const playlist = docSnap.data() as Omit<Playlist, 'id'>;
            const songToRemove = playlist.songs.find(s => s.id === songId);
            if (songToRemove) {
                await updateDoc(playlistRef, {
                    songs: arrayRemove(songToRemove)
                });
                 toast({ title: "Song Removed", description: "The song has been removed from the playlist." });
            }
        }
    } catch (error) {
        console.error("Error removing song from playlist:", error);
        toast({ title: "Error", description: "Could not remove the song.", variant: "destructive" });
    }
  };


  return { playlists, isLoading, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, getPlaylist };
}
