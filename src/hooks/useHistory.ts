
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import type { HistorySong, Song } from "@/types";
import { useToast } from "./use-toast";

const MAX_HISTORY_LENGTH = 50;

export function useHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistorySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const historyRef = doc(db, "userHistory", user.uid);
    const unsubscribe = onSnapshot(historyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // The array is stored with newest first, so no need to reverse.
        setHistory(data.songs || []);
      } else {
        setHistory([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to history:", error);
      toast({ title: "Error", description: "Could not update history in real-time.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addToHistory = useCallback(async (song: Song) => {
    if (!user) return;

    const historyRef = doc(db, "userHistory", user.uid);
    
    // Use client-side timestamp instead of serverTimestamp() inside an array.
    const newHistorySong: HistorySong = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: song.url,
        genre: song.genre,
        albumArt: song.albumArt || `https://picsum.photos/seed/${song.id}/300/300`,
        playedAt: Timestamp.now(), // Use client-side timestamp
    };

    try {
        const docSnap = await getDoc(historyRef);
        if (docSnap.exists()) {
            const existingSongs: HistorySong[] = docSnap.data().songs || [];
            
            // Remove any previous instance of the same song to avoid duplicates
            const filteredSongs = existingSongs.filter(s => s.id !== song.id);

            // Prepend new song and trim the array if it exceeds the max length
            const updatedSongs = [newHistorySong, ...filteredSongs].slice(0, MAX_HISTORY_LENGTH);

            await updateDoc(historyRef, {
                songs: updatedSongs
            });
        } else {
            await setDoc(historyRef, { songs: [newHistorySong] });
        }
    } catch (error) {
        console.error("Error adding to history:", error);
        // Don't toast here as it might be annoying for the user on every song play
    }
  }, [user]);

  return { history, isLoading, addToHistory };
}
