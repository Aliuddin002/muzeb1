import { Music2 } from "lucide-react";
import Link from "next/link";

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
      <Music2 className="h-8 w-8" />
      <h1 className="text-2xl font-bold">Muzeb</h1>
    </Link>
  );
}
