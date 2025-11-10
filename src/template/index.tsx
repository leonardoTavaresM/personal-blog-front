import React, { ReactNode } from "react";
import Navbar from "../components/navbar";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
