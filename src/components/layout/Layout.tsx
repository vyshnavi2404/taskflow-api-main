import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

const Layout = ({ children, showNavbar = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
};

export default Layout;