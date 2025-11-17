"use client";

import CardComponent from "@/pages/homepage/CardComponent";

const upcomingSettings = [
  {
    title: "Privacy controls",
    description: "Manage who can see your posts, groups, and profile activity.",
  },
  {
    title: "Notification preferences",
    description: "Choose the updates you care about across email and in-app.",
  },
  {
    title: "Appearance",
    description: "Toggle themes and personalize how the app feels to you.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <CardComponent className="space-y-4 p-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Fine-tune your experience. We&apos;re laying the groundwork for a
            richer settings hub—here’s what’s on the roadmap.
          </p>
        </div>

        <div className="space-y-3">
          {upcomingSettings.map((setting) => (
            <CardComponent
              className="space-y-1 border border-rose-100 bg-white/85 p-4 text-sm text-neutral-600 shadow-sm"
              key={setting.title}
            >
              <p className="text-sm font-semibold text-neutral-800">
                {setting.title}
              </p>
              <p className="text-xs text-neutral-500">{setting.description}</p>
            </CardComponent>
          ))}
        </div>
      </CardComponent>
    </div>
  );
}


