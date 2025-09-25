"use client";

import { Header } from "@/components/Header";
import Hero from "@/components/Hero";
// Internal Components

function App() {
  return (
    <div className="app-background">
      <Header />
      <Hero />
      <div className="flex items-center justify-center flex-col"></div>
      <div></div>
    </div>
  );
}

export default App;
