import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSetAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AuthState, AuthTokens, AuthUser } from "@/atom/authAtom";
import { setAuthAtom } from "@/atom/authAtom";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { signupSchema, type SignupFormData } from "@/lib/validationSchemas";

type RegisterResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export default function SignupFormDemo() {
  const [formValues, setFormValues] = React.useState<SignupFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = React.useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setAuth = useSetAtom(setAuthAtom);
  const navigate = useNavigate();

  // ⭐ Simplified handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof SignupFormData]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});

    try {
      // Validate form data
      const validatedData = signupSchema.parse(formValues);

      const response = await apiRequest<RegisterResponse, typeof validatedData>(
        "/auth/register/",
        {
          method: "POST",
          body: validatedData,
        },
      );

      const authState: AuthState = {
        tokens: response.tokens,
        user: response.user,
      };

      setAuth(authState);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        // Check if it's a Zod validation error
        const zodError = err as { issues?: Array<{ path: (string | number)[]; message: string }> };
        if (zodError.issues) {
          const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
          zodError.issues.forEach((issue) => {
            const field = issue.path[0] as keyof SignupFormData;
            fieldErrors[field] = issue.message;
          });
          setValidationErrors(fieldErrors);
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong creating your account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[44px] border border-rose-100 bg-white/95 shadow-2xl shadow-rose-200/50 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,214,165,0.35),transparent_65%)]" />

      <div className="relative grid overflow-hidden md:grid-cols-[1.05fr_1fr]">
        {/* LEFT SIDE */}
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
                JainSocials treats every post like a story worth telling. Spark
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

        {/* RIGHT SIDE */}
        <section className="relative bg-white p-8 text-neutral-900 sm:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.2),transparent_60%)]" />

          <div className="relative space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#bc1888]">
              Create account
            </span>

            <h2 className="text-2xl font-semibold text-neutral-900">
              Start your JainSocials journey
            </h2>

            <p className="max-w-md text-sm text-neutral-500">
              Fill in the details below to reserve your handle and meet your
              first followers in minutes.
            </p>
          </div>

          {/* FORM */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <LabelInputContainer>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  type="text"
                  value={formValues.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className={validationErrors.firstName ? "border-red-500 focus:ring-red-500" : ""}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
                )}
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  type="text"
                  value={formValues.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className={validationErrors.lastName ? "border-red-500 focus:ring-red-500" : ""}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.lastName}</p>
                )}
              </LabelInputContainer>

              <LabelInputContainer className="sm:col-span-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Choose a unique username"
                  type="text"
                  value={formValues.username}
                  onChange={handleChange}
                  autoComplete="username"
                  className={validationErrors.username ? "border-red-500 focus:ring-red-500" : ""}
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.username}</p>
                )}
              </LabelInputContainer>

              <LabelInputContainer className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={validationErrors.email ? "border-red-500 focus:ring-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                )}
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={validationErrors.password ? "border-red-500 focus:ring-red-500" : ""}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
                )}
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={validationErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
                )}
              </LabelInputContainer>
            </div>

            <button
              className="group/btn relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-6 font-medium text-white shadow-lg shadow-rose-200/60 transition duration-300 hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
              <BottomGradient />
            </button>

            {error && (
              <p className="text-sm font-medium text-rose-500">{error}</p>
            )}

            <p className="text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-[#bc1888] hover:text-[#f09433] transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
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
}) => (
  <li>
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    <p className="mt-1 text-xs text-white/80">{description}</p>
  </li>
);

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
);
