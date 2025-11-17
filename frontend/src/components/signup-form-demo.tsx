"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const defaultUser = {
  firstName: "Demo",
  lastName: "User",
  username: "demo2",
  email: "demo2@example.com",
  password: "StrongPass123!",
  confirmPassword: "StrongPass123!",
};

type FormField = keyof typeof defaultUser;

export default function SignupFormDemo() {
  const [formValues, setFormValues] = React.useState(defaultUser);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleChange =
    (field: FormField) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Signup request payload:", formValues);
    setIsSubmitted(true);
    window.setTimeout(() => setIsSubmitted(false), 2500);
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_65%)]" />
      <div className="relative grid overflow-hidden md:grid-cols-[1.05fr_1fr]">
        <section className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-blue-600 p-10 text-white md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_65%)] opacity-70" />
          <div className="relative flex h-full flex-col justify-between space-y-10">
            <header className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                Social Media Platform
              </span>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Grow your circle. Share your story. Spark engagement.
              </h1>
              <p className="max-w-md text-sm text-white/80">
                Aceternity helps you connect with friends, publish rich posts,
                and discover the communities that matter to you. Built with
                creators and tastemakers in mind, our tools keep the focus on
                authentic conversations.
              </p>
            </header>
            <ul className="space-y-4 text-sm text-white/85">
              <FeatureItem
                title="Find new friends"
                description="Curated suggestions and shared interests bring the right people to your feed."
              />
              <FeatureItem
                title="Create standout posts"
                description="Composer supports images, video, polls, and scheduling so your voice carries."
              />
              <FeatureItem
                title="Measure engagement"
                description="Insights dashboards track reach, reactions, and growth to refine your strategy."
              />
            </ul>
          </div>
        </section>

        <section className="relative bg-white/95 p-8 text-neutral-900 dark:bg-zinc-950/90 dark:text-neutral-100 sm:p-10">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-indigo-400">
              Create account
            </span>
            <h2 className="text-2xl font-semibold">
              Your journey on Aceternity starts here
            </h2>
            <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              Fill in the details below to reserve your handle and meet your
              first followers in minutes.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <LabelInputContainer>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Demo"
                  type="text"
                  value={formValues.firstName}
                  onChange={handleChange("firstName")}
                  autoComplete="given-name"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="User"
                  type="text"
                  value={formValues.lastName}
                  onChange={handleChange("lastName")}
                  autoComplete="family-name"
                />
              </LabelInputContainer>
              <LabelInputContainer className="sm:col-span-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="demo2"
                  type="text"
                  value={formValues.username}
                  onChange={handleChange("username")}
                  autoComplete="username"
                />
              </LabelInputContainer>
              <LabelInputContainer className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="demo2@example.com"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="StrongPass123!"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange("password")}
                  autoComplete="new-password"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  placeholder="StrongPass123!"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  autoComplete="new-password"
                />
              </LabelInputContainer>
            </div>

            <button
              className="group/btn relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 font-medium text-white shadow-lg shadow-indigo-500/25 transition duration-300 hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:from-indigo-500 dark:via-purple-500 dark:to-sky-500 dark:shadow-none"
              type="submit"
            >
              Sign up
              <BottomGradient />
            </button>

            {isSubmitted && (
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Details captured! Check your console for the payload.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

const FeatureItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <li>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-white/75">{description}</p>
    </li>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
