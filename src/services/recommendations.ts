import type { Song } from "@/types";
import { getSongById } from "./fma";

const API_URL = "https://aliuddin002-recomm1.hf.space/recommend";

interface RecommendationRequest {
    track_ids: number[];
    source: 'history' | 'favorites';
    top_k?: number;
}

interface RecommendationResponseItem {
    track_id: number;
    title: string;
    genre_top: string;
    artist_name: string;
    similarity: number;
}

interface GetRecommendationsParams {
    songs: Song[];
    source: 'history' | 'favorites';
    top_k?: number;
}

export async function getRecommendations({ songs, source, top_k = 10 }: GetRecommendationsParams): Promise<Song[]> {
    const trackIds = songs.map(song => parseInt(song.id, 10)).filter(id => !isNaN(id));

    if (trackIds.length === 0) {
        return [];
    }

    const requestBody: RecommendationRequest = {
        track_ids: trackIds,
        source: source,
        top_k: top_k
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }

        const recommendedItems: RecommendationResponseItem[] = await response.json();

        // The API returns basic track info. We need to fetch the full Song object
        // from our database to get details like the audio URL.
        const songPromises = recommendedItems.map(item => getSongById(item.track_id.toString()));
        const fullSongs = await Promise.all(songPromises);
        
        // Filter out any songs that couldn't be found in our database
        return fullSongs.filter((song): song is Song => song !== undefined);

    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        throw error; // Re-throw the error to be handled by the calling hook
    }
}
