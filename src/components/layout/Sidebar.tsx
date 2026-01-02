import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChefHat, 
  CalendarDays, 
  ShoppingCart, 
  ClipboardList,
  Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: ChefHat, label: 'My Dishes', path: '/' },
  { icon: CalendarDays, label: 'Weekly Menu', path: '/weekly-menu' },
  { icon: ShoppingCart, label: 'Grocery List', path: '/grocery-list' },
  { icon: ClipboardList, label: 'Meal Prep', path: '/meal-prep' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-20 bg-card shadow-card border-r border-border flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-8 p-3 rounded-2xl bg-primary/20">
        <Utensils className="w-7 h-7 text-primary-foreground" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-soft' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom decorative element */}
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
          <span className="text-lg">🥗</span>
        </div>
      </div>
    </aside>
  );
}
