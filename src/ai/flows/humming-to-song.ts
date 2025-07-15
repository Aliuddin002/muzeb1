
'use server'

/**
 * @fileOverview This file defines a Genkit flow for generating song recommendations based on user humming input.
 *
 * - hummingToSongRecommendations - A function that takes a humming input and returns song recommendations.
 * - HummingToSongRecommendationsInput - The input type for the hummingToSongRecommendations function.
 * - HummingToSongRecommendationsOutput - The output type for the hummingToSongRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getSongs, Song as FmaSong} from '@/services/fma';

const HummingToSongRecommendationsInputSchema = z.object({
  humming: z
    .string()
    .describe("A recording of humming, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type HummingToSongRecommendationsInput = z.infer<
  typeof HummingToSongRecommendationsInputSchema
>;

// Define a Zod schema for the song, matching the FmaSong type
const SongSchema = z.object({
  id: z.string().describe('The unique ID of the song.'),
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
  url: z.string().describe('The URL of the song.'),
  genre: z.string().describe('The genre of the song.'),
  albumArt: z.string().optional().describe('The optional album art URL.')
});

const HummingToSongRecommendationsOutputSchema = z.object({
  songs: z.array(SongSchema).describe('An array of song recommendations based on the humming.'),
});

export type HummingToSongRecommendationsOutput = z.infer<
  typeof HummingToSongRecommendationsOutputSchema
>;

export async function hummingToSongRecommendations(
  input: HummingToSongRecommendationsInput
): Promise<HummingToSongRecommendationsOutput> {
  return hummingToSongRecommendationsFlow(input);
}

const hummingToSongRecommendationsPrompt = ai.definePrompt({
  name: 'hummingToSongRecommendationsPrompt',
  input: {schema: HummingToSongRecommendationsInputSchema},
  output: {schema: HummingToSongRecommendationsOutputSchema},
  prompt: `You are a music recommendation expert. Given a recording of humming, you will identify the melody and recommend songs that match the melody. Respond with a list of songs including their id, title, artist, url, genre, and optionally albumArt. Here is the humming recording: {{media url=humming}}`,
});

const hummingToSongRecommendationsFlow = ai.defineFlow(
  {
    name: 'hummingToSongRecommendationsFlow',
    inputSchema: HummingToSongRecommendationsInputSchema,
    outputSchema: HummingToSongRecommendationsOutputSchema,
  },
  async (input: HummingToSongRecommendationsInput): Promise<HummingToSongRecommendationsOutput> => {
    // A real implementation would use a specialized model to process the humming.
    // For now, we return a mocked list of songs.
    // The Gemini 1.5 Pro model can do this, but may need specific prompt engineering.
    // For example:
    // const { output } = await hummingToSongRecommendationsPrompt(input);
    // if (!output) {
    //   throw new Error('No output from hummingToSongRecommendationsPrompt');
    // }
    // return output;

    // As a placeholder, we return a few songs from the database.
    const fetchedSongs: FmaSong[] = await getSongs({ query: 'jazz' });
    
    // Ensure the mock songs conform to the schema and return a few.
    return {songs: fetchedSongs.slice(0, 5)};
  }
);
