import { Bell, Search, User, Archive } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-secondary text-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-gray-200">
            <Archive size={28} />
            <span className="text-xl font-bold">Tinventory Manager</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 rounded-full bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-5">
          <button className="text-white hover:text-gray-200 focus:outline-none">
            <Bell size={22} />
          </button>
          <button className="text-white hover:text-gray-200 focus:outline-none">
            <User size={22} />
          </button>
        </div>
      </div>
    </header>
  );
} 