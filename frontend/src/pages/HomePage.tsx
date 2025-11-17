"use client";
import FeedComponent from "@/pages/homepage/FeedComponent";
import PeopleYouMayKnowComponent from "@/pages/homepage/PeopleYouMayKnowComponent";
import SidebarComponent from "@/pages/homepage/SidebarComponent";

const navigation = [
  { label: "Posts", to: "/feed" },
  { label: "Groups", to: "/groups" },
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: "/settings" },
];

const suggestions = [
  { name: "Ram Prasad", mutuals: "4 mutuals" },
  { name: "Hari Prasad", mutuals: "2 mutuals" },
  { name: "Bom Lam", mutuals: "Just joined" },
];

const feedCards = [
  {
    author: "Hari Prasad",
    time: "2h ago",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60",
    caption:
      "Weekend getaway vibes. 🌅 Drop a 💜 if you’re ready for a digital detox!",
    likes: 482,
    comments: 56,
  },
  {
    author: "Aakriti Sharma",
    time: "6h ago",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
    caption:
      "New beginnings. Building a photography club in the city—who’s in?",
    likes: 239,
    comments: 31,
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#fff3e0] via-[#ffe6f2] to-[#ffd1dc] px-4 py-10 text-neutral-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-[48px] border border-rose-100 bg-white/95 p-6 shadow-xl shadow-rose-200/50 backdrop-blur-lg md:grid-cols-[260px_1fr_280px] md:p-10">
        <SidebarComponent
          navigation={navigation}
          user={{ name: "Aakash", title: "Creator & host" }}
        />
        <FeedComponent
          onCreatePost={() => console.log("Create post clicked")}
          posts={feedCards}
        />
        <PeopleYouMayKnowComponent suggestions={suggestions} />
      </div>
    </main>
  );
}

