import { Anton } from "next/font/google";
import type { ReactNode } from "react";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${anton.variable} landing-scope min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
    >
      {children}
    </div>
  );
}
