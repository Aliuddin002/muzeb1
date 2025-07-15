
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mic, StopCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSongById } from "@/services/fma";
import type { Song } from "@/types";
import { cn } from "@/lib/utils";
import WavEncoder from 'wav-encoder';

// Helper function to convert AudioBuffer to a valid WAV Blob
const toWav = (audioBuffer: AudioBuffer): Blob => {
  const pcmData = audioBuffer.getChannelData(0); // Get data from channel 0
  const sampleRate = audioBuffer.sampleRate;
  
  // Encode the PCM data into a WAV file format
  const wavArrayBuffer = WavEncoder.encode.sync({
    sampleRate: sampleRate,
    channelData: [pcmData],
    bitDepth: 16, // Use a standard bit depth
  });
  
  return new Blob([wavArrayBuffer], { type: 'audio/wav' });
};


export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingHum, setIsProcessingHum] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
       if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    }
  };

  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if(isProcessingHum) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsProcessingHum(true);
        toast({ title: "Recording Stopped", description: "Analyzing your hum..." });
        
        try {
          // 1. Create a blob from the recorded chunks
          const audioBlob = new Blob(audioChunksRef.current);
          const arrayBuffer = await audioBlob.arrayBuffer();

          // 2. Decode the audio data to get raw PCM data
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // 3. Encode the raw PCM data into a WAV blob
          const wavBlob = toWav(audioBuffer);

          // 4. Send the WAV blob to the API
          const formData = new FormData();
          formData.append("file", wavBlob, "hum.wav");

          const response = await fetch("https://aliuddin002-qbh-api.hf.space/qbh", {
            method: "POST",
            body: formData,
          });

          // Stop the media stream tracks
          stream.getTracks().forEach(track => track.stop());

          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            throw new Error(`API request failed with status ${response.status}`);
          }

          const results = await response.json();
          
          if (results.matches && results.matches.length > 0) {
            const songIds = results.matches.map((match: any) => match.track_id.toString());
            const songPromises = songIds.map((id: string) => getSongById(id));
            const foundSongs = (await Promise.all(songPromises)).filter((s): s is Song => s !== undefined);
            
            if (foundSongs.length > 0) {
                const searchIds = foundSongs.map(s => s.id);
                router.push(`/search?ids=${encodeURIComponent(JSON.stringify(searchIds))}&q=hum-based-search`);
            } else {
                 toast({
                    title: "No Matches Found in DB",
                    description: "Your hum was recognized, but the songs couldn't be found in our library.",
                    variant: "default",
                });
            }

          } else {
            toast({
                title: "No Matches Found",
                description: "Your hum didn't match any songs. Please try again.",
                variant: "default",
            });
          }
        } catch (apiError: any) {
          console.error("Query by humming AI error:", apiError);
          toast({
            title: "Humming Analysis Failed",
            description: apiError.message || "Could not get recommendations from your hum. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessingHum(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Start humming your tune for 5 seconds!" });

      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = setTimeout(stopRecording, 5000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsProcessingHum(false);
    }
  };

  return (
     <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for songs or hum a tune..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 md:pr-12 py-3 h-11 md:h-12 text-sm md:text-base rounded-full shadow-sm focus:ring-2 focus:ring-accent"
          aria-label="Search songs or artists"
        />
      </div>
      <Button
        type="button"
        size="icon"
        onClick={startRecording}
        className={cn(
          "h-11 w-11 md:h-12 md:w-12 rounded-full transition-colors duration-300 focus:ring-2 focus:ring-accent",
          isRecording ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-accent text-accent-foreground hover:bg-accent/90"
        )}
        disabled={isProcessingHum}
        aria-label={isRecording ? "Stop recording" : "Start recording hum"}
      >
        {isProcessingHum ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : isRecording ? <StopCircle className="h-5 w-5 md:h-6 md:w-6" /> : <Mic className="h-5 w-5 md:h-6 md:w-6" />}
      </Button>
      {searchTerm && (
         <Button type="submit" size="icon" className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-accent" aria-label="Submit search">
          <Search className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      )}
    </form>
  );
}
