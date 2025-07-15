import type { User as FirebaseUser } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  genre: string;
  albumArt?: string; // Changed back to optional to match service
}

export interface HistorySong extends Song {
  playedAt: Timestamp;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Timestamp;
}

export interface AppUser extends FirebaseUser {}
