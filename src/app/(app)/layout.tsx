import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { AudioControls } from "@/components/player/AudioControls";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ScrollArea className="flex-1">
        <main className="container mx-auto px-4 py-8 md:px-8 mb-28 md:mb-32">
         {children}
        </main>
      </ScrollArea>
      <AudioControls />
    </div>
  );
}
