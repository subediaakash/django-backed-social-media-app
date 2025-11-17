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
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[44px] border border-rose-100 bg-white/95 shadow-2xl shadow-rose-200/50 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,214,165,0.35),transparent_65%)]" />
      <div className="relative grid overflow-hidden md:grid-cols-[1.05fr_1fr]">
        <section className="relative flex flex-col justify-between bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] p-10 text-white md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_70%)] opacity-80" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <header className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Social Media Platform
              </span>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Share vibrant moments and build authentic connections.
              </h1>
              <p className="max-w-md text-sm text-white/85">
                Aceternity treats every post like a story worth telling. Spark
                conversations, celebrate milestones, and be part of a community
                that feels alive.
              </p>
            </header>
            <ul className="space-y-4 text-sm text-white/90">
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

        <section className="relative bg-white p-8 text-neutral-900 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.2),transparent_60%)]" />
          <div className="relative space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#bc1888]">
              Create account
            </span>
            <h2 className="text-2xl font-semibold text-neutral-900">
              Start your Aceternity journey
            </h2>
            <p className="max-w-md text-sm text-neutral-500">
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
              className="group/btn relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-6 font-medium text-white shadow-lg shadow-rose-200/60 transition duration-300 hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60"
              type="submit"
            >
              Sign up
              <BottomGradient />
            </button>

            {isSubmitted && (
              <p className="text-sm font-medium text-[#bc1888]">
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
      <p className="mt-1 text-xs text-white/80">{description}</p>
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
