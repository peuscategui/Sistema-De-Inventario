import { Bell, Search, User, Archive } from "lucide-react";

export default function Header() {
  return (
    <header 
      className="relative flex h-24 items-center justify-between border-b border-border/20 px-8 text-secondary-foreground bg-secondary"
    >
      <div className="relative z-10 flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Archive className="h-7 w-7" />
          <h1 className="text-xl font-semibold">TInventory Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar..."
              className="w-64 rounded-full border border-transparent bg-black/20 py-2 pl-10 pr-4 text-sm text-secondary-foreground placeholder-gray-400 transition-all focus:w-72 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="rounded-full p-2 transition-colors hover:bg-black/20">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-black/20">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 