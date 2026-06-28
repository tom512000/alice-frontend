import { cn } from '@/lib/cn';
import { createContext, useContext, useState, type ReactNode } from 'react';

interface TabsContextValue {
  active: string;
  setActive: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex gap-0 border-b border-gray-200 overflow-x-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabTrigger({ value, children, className }: TabTriggerProps) {
  const ctx = useContext(TabsContext)!;
  const isActive = ctx.active === value;
  return (
    <button
      onClick={() => ctx.setActive(value)}
      className={cn(
        'shrink-0 px-4 py-2.5 text-sm font-medium font-poppins transition-all border-b-2 -mb-px',
        isActive
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const ctx = useContext(TabsContext)!;
  if (ctx.active !== value) return null;
  return <div className={cn('py-4', className)}>{children}</div>;
}
