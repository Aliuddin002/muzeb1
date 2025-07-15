"use client";

import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume1, Volume2, VolumeX, SkipForward, SkipBack, Loader2, Music } from "lucide-react";
import Image from "next/image";
import { formatTime } from "@/lib/utils";

export function AudioControls() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    isLoading,
    duration,
    currentTime,
    seek,
    volume,
    setVolume
  } = useAudioPlayer();

  if (!currentSong) {
    return null; // Don't render if no song is selected or playing
  }
  
  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-2 md:p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-2 md:gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-2 md:gap-3 w-1/3 md:w-1/4">
          <div className="h-10 w-10 md:h-14 md:w-14 flex-shrink-0">
            {currentSong.albumArt ? (
              <Image
                src={currentSong.albumArt}
                alt={currentSong.title}
                width={56}
                height={56}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="album cover"
              />
            ) : (
              <div className="h-full w-full rounded-md bg-muted flex items-center justify-center" data-ai-hint="music note">
                <Music className="text-muted-foreground h-5 w-5 md:h-6 md:w-6" />
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-sm truncate text-foreground">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 w-1/3 md:max-w-xl">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" disabled className="hidden md:inline-flex">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlayPause} disabled={isLoading} className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6" /> : <Play className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>
            <Button variant="ghost" size="icon" disabled className="hidden md:inline-flex">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 0}
              step={1}
              onValueChange={handleSeek}
              className="flex-1 [&>span:first-child]:h-1.5 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-primary"
              disabled={isLoading || duration === 0}
            />
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
          <VolumeIcon className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 [&>span:first-child]:h-1.5 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-primary"
          />
        </div>
         <div className="flex md:hidden w-1/3 justify-end">
            {/* Placeholder for potential mobile specific controls, keeps layout even */}
        </div>
      </div>
    </div>
  );
}
