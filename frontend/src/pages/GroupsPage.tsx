"use client";

import CardComponent from "@/pages/homepage/CardComponent";

const featuredGroups = [
  {
    name: "Creative Sparks",
    description: "Share daily inspiration with fellow designers and artists.",
  },
  {
    name: "Product Builders",
    description: "Collaborate on shipping features with other product teams.",
  },
  {
    name: "Weekend Photographers",
    description: "Trade tips, presets, and feedback on your latest shots.",
  },
];

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <CardComponent className="space-y-4 p-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Groups</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Discover collaborative spaces curated for your interests. Create a
            new group or explore some of the featured communities below.
          </p>
        </div>

        <div className="space-y-3">
          {featuredGroups.map((group) => (
            <CardComponent
              className="space-y-1 border border-rose-100 bg-white/85 p-4 text-sm text-neutral-600 shadow-sm"
              key={group.name}
            >
              <p className="text-sm font-semibold text-neutral-800">
                {group.name}
              </p>
              <p className="text-xs text-neutral-500">{group.description}</p>
            </CardComponent>
          ))}
        </div>
      </CardComponent>
    </div>
  );
}


