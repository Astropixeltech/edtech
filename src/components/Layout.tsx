import { ReactNode } from "react";
import CoursesNavbar from "./CoursesNavbar";
import CoursesFooter from "./CoursesFooter";

interface LayoutProps {
  children: ReactNode;
  flushTop?: boolean;
  noLayout?: boolean;
}

const Layout = ({ children, flushTop = false, noLayout = false }: LayoutProps) => {
  if (noLayout) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CoursesNavbar />
      <main className="flex-1 pt-20 sm:pt-24">
        {children}
      </main>
      <CoursesFooter />
    </div>
  );
};

export default Layout;

