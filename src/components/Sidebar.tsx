import { BookOpen, Users, FolderKanban, HelpCircle } from 'lucide-react';

const NAV_ITEMS = [
  {
    title: "New Chat",
    variant: "primary"
  },
  {
    icon: Users,
    title: "Community"
  },
  {
    icon: BookOpen,
    title: "Library"
  },
  {
    icon: FolderKanban,
    title: "Projects"
  },
  {
    icon: HelpCircle,
    title: "Feedback"
  }
];

const RECENT_CHATS = [
  "Landing Page Design",
  "API Integration Help",
  "Next.js Auth Setup",
  "Database Schema Review",
  "Tailwind Components",
  "React Performance Issue",
  "Docker Setup Guide",
  "GraphQL Query Help",
  "UI Animation Bug",
  "TypeScript Types"
];

export function Sidebar() {
  return (
    <div className="relative h-screen w-64 bg-background/95 flex flex-col border-r border-border/50 py-6 px-3">
      <div className="mb-8 px-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Shunya
        </h1>
        <p className="text-xs text-muted-foreground mt-1">AI Builder Platform</p>
      </div>
      
      <nav className="space-y-1.5 mb-6">
        {NAV_ITEMS.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              item.variant === "primary" 
                ? "bg-muted/60 text-foreground hover:bg-muted border border-border/40"
                : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0 flex flex-col border-t border-border/30 pt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Chats</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {RECENT_CHATS.map((chat, index) => (
            <button 
              key={index} 
              className="w-full text-left px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all truncate"
              title={chat}
            >
              {chat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}