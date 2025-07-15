import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {children}
    </main>
  );
}
