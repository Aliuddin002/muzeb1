
"use client";
import type { Song } from "@/types";
import type { ReactNode} from "react";
import React, {
    useState, 
    useRef, 
    useEffect, 
    createContext, 
    useContext, 
    useCallback 
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/contexts/AuthContext";

interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToHistory } = useHistory();

  // Effect to set up the audio element and its listeners
  useEffect(() => {
    // Create the audio element instance
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const audioElement = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handleDurationChange = () => setDuration(audioElement.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => setIsPlaying(false);

    const handleCanPlay = () => {
      setIsLoading(false);
      // When the audio is ready, play it if the state is already `playing`
      if (audioElement.paused && isPlaying) {
          audioElement.play().catch(err => {
              if (err.name !== 'AbortError') {
                 console.error("Play error on canplay:", err);
                 toast({ title: "Playback Error", description: "Could not play audio.", variant: "destructive" });
              }
          });
      }
    };
    
    const handleError = (e: Event) => {
      const error = (e.target as HTMLAudioElement).error;
      if (error?.code === MediaError.MEDIA_ERR_ABORTED) {
        return; // Ignore abort errors from rapid source changes
      }
      console.error("Audio Element Error:", error);
      setIsLoading(false);
      setIsPlaying(false);
      if (currentSong) {
        toast({
            title: "Playback Error",
            description: `Could not play ${currentSong.title}. The audio source may be invalid or unavailable.`,
            variant: "destructive",
        });
      }
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("durationchange", handleDurationChange);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("waiting", handleWaiting);
    audioElement.addEventListener("playing", handlePlaying);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("canplay", handleCanPlay);
    audioElement.addEventListener("error", handleError);

    return () => {
      audioElement.pause();
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("durationchange", handleDurationChange);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("waiting", handleWaiting);
      audioElement.removeEventListener("playing", handlePlaying);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("canplay", handleCanPlay);
      audioElement.removeEventListener("error", handleError);
    };
  // `isPlaying` is added to deps to re-evaluate canplay logic
  // `currentSong` and `toast` are dependencies for the error handler
  }, [isPlaying, currentSong, toast]);

  // Effect to handle changing the song source
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load(); // Explicitly load the new source
    }
  }, [currentSong]);


  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
       audioRef.current.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Toggle play error", err);
            toast({ title: "Playback Error", description: "Could not play audio.", variant: "destructive" });
          }
       });
    }
    // The event listeners will handle setting isPlaying state
  }, [isPlaying, currentSong, toast]);


  const playSong = useCallback((song: Song) => {
    if (currentSong?.id === song.id) {
        togglePlayPause();
        return;
    }

    setCurrentSong(song);
    setIsPlaying(true); // Set intent to play
    setIsLoading(true);

    if (user) {
        addToHistory(song);
    }
  }, [currentSong, togglePlayPause, user, addToHistory]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current && isFinite(vol)) {
      const newVolume = Math.max(0, Math.min(1, vol));
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  }, []);

  const value = {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    audioRef: audioRef as React.RefObject<HTMLAudioElement>,
    isLoading,
    duration,
    currentTime,
    seek,
    volume,
    setVolume,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};
