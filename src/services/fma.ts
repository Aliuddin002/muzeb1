import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  startAfter as firestoreStartAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

import {db} from '@/lib/firebase';
/**
 * Represents a song from the Free Music Archive (FMA).
 */
export interface Song {
  /**
   * The unique ID of the song.
   */
  id: string;
  /**
   * The title of the song.
   */
  title: string;
  /**
   * The artist of the song.
   */
  artist: string;
  /**
   * The URL of the song.
   */
  url: string;
  /**
   * The genre of the song.
   */
  genre: string;
  /**
   * The optional album art URL.
   */
  albumArt?: string;
}

/**
 * Represents the search parameters for songs.
 */
export interface SongSearchParams {
  /**
   * The search query.
   */
  query?: string;
  /**
   * The maximum number of songs to return.
   */
  limit?: number;
  /**
   * The document snapshot to start after for pagination.
   */
  startAfter?: QueryDocumentSnapshot<DocumentData>;
}

export interface PaginatedSongs {
  songs: Song[];
  lastVisible?: QueryDocumentSnapshot<DocumentData>;
}

const songsCollection = collection(db, 'songs');

function docToSong(doc: QueryDocumentSnapshot<DocumentData>): Song {
  const data = doc.data();
  // Use genre as the seed for the image to make them consistent per genre
  const genreSeed = encodeURIComponent(data.genre_top || 'default');
  return {
    id: doc.id,
    title: data.title,
    artist: data.artist_name,
    url: data.audio_url,
    genre: data.genre_top,
    albumArt: `https://picsum.photos/seed/${genreSeed}/300/300`,
  };
}

/**
 * Asynchronously retrieves songs from Firestore with pagination.
 *
 * @param searchParams The search parameters including limit and startAfter for pagination.
 * @returns A promise that resolves to an object containing the songs and the last visible document.
 */
export async function getSongs(
  searchParams?: SongSearchParams
): Promise<PaginatedSongs> {
  // If there's a search query, we fetch all and filter client-side.
  // This does not support pagination and is not ideal for very large datasets.
  if (searchParams?.query) {
    const querySnapshot = await getDocs(songsCollection);
    let songs = querySnapshot.docs.map(docToSong);
    const searchTerm = searchParams.query.toLowerCase();
    songs = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
    );
    return { songs, lastVisible: undefined }; // No lastVisible for search
  }
  
  // If no search query, build a paginated query.
  const queryConstraints = [
      orderBy('track_id'), // Use a field that exists on all documents for consistent ordering
      limit(searchParams?.limit || 10)
  ];

  if (searchParams?.startAfter) {
      queryConstraints.push(firestoreStartAfter(searchParams.startAfter));
  }

  const q = query(songsCollection, ...queryConstraints);
  const querySnapshot = await getDocs(q);

  const songs = querySnapshot.docs.map(docToSong);
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

  return { songs, lastVisible };
}

export async function getSongById(id: string): Promise<Song | undefined> {
  const docRef = doc(db, 'songs', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docToSong(docSnap as QueryDocumentSnapshot<DocumentData>);
  } else {
    return undefined;
  }
}
