"use client";
import CardComponent from "@/pages/homepage/CardComponent";

type Suggestion = {
  name: string;
  mutuals: string;
};

type PeopleYouMayKnowComponentProps = {
  suggestions: Suggestion[];
};

export default function PeopleYouMayKnowComponent({
  suggestions,
}: PeopleYouMayKnowComponentProps) {
  return (
    <CardComponent className="flex h-full flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          People you may know
        </h2>
        <p className="text-xs text-neutral-500">
          Connect with creators you’ll love collaborating with.
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <CardComponent
            className="flex items-center justify-between border border-rose-100 bg-white/80 p-4 text-sm text-neutral-600 shadow-sm"
            key={suggestion.name}
          >
            <div>
              <p className="font-semibold text-neutral-800">
                {suggestion.name}
              </p>
              <p className="text-xs text-neutral-400">{suggestion.mutuals}</p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-xl bg-[#ffe6f2] px-3 py-2 text-xs font-semibold text-[#bc1888] transition hover:bg-[#f9a8d4]/30">
              + Follow
            </button>
          </CardComponent>
        ))}
      </div>

      <CardComponent className="border border-rose-100 bg-[#fff0f5]/70 p-4 text-xs text-neutral-500">
        <p className="font-semibold text-neutral-700">Tips for today</p>
        <ul className="mt-2 space-y-2">
          <li>• Share behind-the-scenes moments.</li>
          <li>• Invite friends to your newest group.</li>
          <li>• Try reels to boost engagement.</li>
        </ul>
      </CardComponent>
    </CardComponent>
  );
}

