import type { Song } from "@/types";
import { SongList } from "@/components/song/SongList";
import { AlertCircle, Lightbulb } from "lucide-react";

interface RecommendationSectionProps {
  title: string;
  recommendations: Song[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
  layout?: 'grid' | 'slider';
}

export function RecommendationSection({ title, recommendations, isLoading, error, emptyMessage = "No recommendations available at the moment.", layout = 'grid' }: RecommendationSectionProps) {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-primary flex items-center">
        <Lightbulb className="mr-3 h-8 w-8 text-accent" />
        {title}
      </h2>
      {error && (
        <div className="flex items-center text-destructive bg-destructive/10 p-4 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>Could not load recommendations: {error.message}</p>
        </div>
      )}
      <SongList
        songs={recommendations}
        isLoading={isLoading && !error} // only show skeleton if loading and no error
        error={null} // error is handled above
        emptyMessage={emptyMessage}
        layout={layout}
      />
    </section>
  );
}
