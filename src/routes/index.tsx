import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Footer } from "@/components/site/Footer";
import { ShowcaseCarousel } from "@/components/site/ShowcaseCarousel";
import { NotesShowcase } from "@/components/site/NotesShowcase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "One platform to connect | Zoom" },
      { name: "description", content: "Bridge the gap between talking and doing with the AI-first work platform built for you." },
      { property: "og:title", content: "One platform to connect | Zoom" },
      { property: "og:description", content: "AI-first work platform for meetings, chat, phone and more." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background">
      <Navbar />
      <Hero />
      <ShowcaseCarousel />
      <NotesShowcase />
      <Footer />
    </div>
  );
}
