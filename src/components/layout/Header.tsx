import { AppLogo } from "@/components/layout/AppLogo";
import { UserNav } from "@/components/layout/UserNav";
import { SearchBar } from "@/components/search/SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary/10 backdrop-blur-md">
      <div className="container flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 px-4 md:px-8">
        <div className="hidden md:flex">
         <AppLogo />
        </div>
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
