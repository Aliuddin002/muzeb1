"use client";

import { useHistory } from "@/hooks/useHistory";
import { SongList } from "@/components/song/SongList";
import { Clock, Frown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HistoryPage() {
    const { user } = useAuth();
    const { history, isLoading } = useHistory();

    if (!user) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
            <Frown className="h-24 w-24 text-primary mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Login to See Your History</h2>
            <p className="text-muted-foreground mb-6">
              Your listening history will appear here once you log in.
            </p>
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
          </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Clock className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">Listening History</h1>
            </div>

            <SongList 
                songs={history} 
                isLoading={isLoading} 
                emptyMessage="You haven't played any songs yet."
            />
        </div>
    )
}
