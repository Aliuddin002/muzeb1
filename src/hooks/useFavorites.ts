
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import type { Song } from "@/types";
import { useToast } from "./use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This effect now uses onSnapshot for real-time updates.
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userFavoritesRef = doc(db, "userFavorites", user.uid);
    
    const unsubscribe = onSnapshot(userFavoritesRef, (docSnap) => {
      if (docSnap.exists()) {
        setFavorites(docSnap.data().songs || []);
      } else {
        // If the document doesn't exist for a logged-in user, create it.
        setDoc(userFavoritesRef, { songs: [] })
          .then(() => setFavorites([]))
          .catch(err => console.error("Failed to create userFavorites doc", err));
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to favorites:", error);
      toast({ title: "Error", description: "Could not sync favorites in real-time.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount or user change.
  }, [user, toast]);


  const addFavorite = async (song: Song) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to add favorites.", variant: "destructive" });
      return;
    }
    const userFavoritesRef = doc(db, "userFavorites", user.uid);
    try {
      // Use updateDoc with arrayUnion. This is safe even if the doc doesn't exist yet, 
      // but the onSnapshot effect should handle creation. For robustness, we can ensure it exists.
      const docSnap = await getDoc(userFavoritesRef);
      if (docSnap.exists()) {
         await updateDoc(userFavoritesRef, { songs: arrayUnion(song) });
      } else {
         await setDoc(userFavoritesRef, { songs: [song] });
      }
      toast({ title: "Added to Favorites", description: `${song.title} added to your favorites.` });
    } catch (error) {
      console.error("Error adding favorite:", error);
      toast({ title: "Error", description: "Could not add to favorites.", variant: "destructive" });
    }
  };

  const removeFavorite = async (songId: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to remove favorites.", variant: "destructive" });
      return;
    }
    const userFavoritesRef = doc(db, "userFavorites", user.uid);
    try {
      const docSnap = await getDoc(userFavoritesRef);
      if (docSnap.exists()) {
        const currentFavorites = docSnap.data().songs || [];
        const songToRemove = currentFavorites.find((s: Song) => s.id === songId);
        if (songToRemove) {
          await updateDoc(userFavoritesRef, {
            songs: arrayRemove(songToRemove)
          });
          toast({ title: "Removed from Favorites", description: `Song removed from your favorites.` });
        }
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({ title: "Error", description: "Could not remove from favorites.", variant: "destructive" });
    }
  };
  
  // No longer need fetchFavorites as onSnapshot handles it.
  return { favorites, addFavorite, removeFavorite, isLoading };
}
