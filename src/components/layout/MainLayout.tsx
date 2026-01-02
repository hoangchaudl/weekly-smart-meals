import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  rightPanel?: ReactNode;
}

export function MainLayout({ children, title, subtitle, rightPanel }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content area */}
      <div className="ml-20 flex">
        {/* Center content */}
        <main className={cn("flex-1 p-8", rightPanel ? "pr-4" : "")}>
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </header>
          
          {/* Page content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {children}
          </div>
        </main>

        {/* Right panel (optional) */}
        {rightPanel && (
          <aside className="w-80 p-4 pt-8 animate-slide-in-right">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
