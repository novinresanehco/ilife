import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar />
      <main className="mr-64 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
};
