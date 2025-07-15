"use client";

import Link from "next/link";
import type { Playlist } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListMusic, Trash2, ArrowRight } from "lucide-react";
import { usePlaylists } from "@/hooks/usePlaylists";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
    const { deletePlaylist } = usePlaylists();

    return (
        <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-center items-center h-20 w-20 rounded-lg bg-primary/10 mx-auto mb-4">
                   <ListMusic className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-center truncate">{playlist.name}</CardTitle>
                <CardDescription className="text-center">{playlist.songs?.length || 0} songs</CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-2">
                <Link href={`/playlists/${playlist.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                       View Playlist <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "{playlist.name}" playlist.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePlaylist(playlist.id)}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </CardFooter>
        </Card>
    );
}
