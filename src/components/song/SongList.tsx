import type { Song } from "@/types";
import { SongCard } from "./SongCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListMusic, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface SongListProps {
  songs: Song[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  layout?: 'grid' | 'slider';
  onEndReached?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

export function SongList({ 
  songs, 
  isLoading, 
  error, 
  emptyMessage = "No songs found.", 
  layout = 'grid',
  onEndReached,
  hasMore,
  isFetchingMore
}: SongListProps) {
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const skeletonCount = layout === 'slider' ? 5 : 10;
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (layout !== 'slider' || !onEndReached) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          onEndReached();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [layout, onEndReached, hasMore, isFetchingMore]);


  if (isLoading) {
    const skeletons = Array.from({ length: skeletonCount }).map((_, index) => (
       <div key={index} className="w-60 flex-shrink-0 rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
        <div className="aspect-square w-full bg-muted rounded-t-lg"></div>
        <div className="p-4 space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded"></div>
          <div className="h-4 w-1/2 bg-muted rounded"></div>
          <div className="h-3 w-1/4 bg-muted rounded mt-1"></div>
        </div>
        <div className="p-4 pt-0">
          <div className="h-9 w-full bg-muted rounded"></div>
        </div>
      </div>
    ));

    if (layout === 'slider') {
      return (
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {skeletons}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {skeletons}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ListMusic className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load songs: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (songs.length === 0) {
    return (
      <Alert>
        <ListMusic className="h-4 w-4" />
        <AlertTitle>No Songs</AlertTitle>
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  if (layout === 'slider') {
    return (
        <div className="relative group/slider">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover/slider:opacity-100 transition-opacity"
                onClick={() => scroll('left')}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {songs.map((song) => (
                    <SongCard key={song.id} song={song} />
                ))}
                {hasMore && (
                  <div ref={sentinelRef} className="flex-shrink-0 w-1">
                    {isFetchingMore && (
                      <div className="flex items-center justify-center w-60 h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
            </div>
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover/slider:opacity-100 transition-opacity"
                onClick={() => scroll('right')}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
