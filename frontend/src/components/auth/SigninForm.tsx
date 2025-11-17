"use client";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSetAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AuthState, AuthTokens, AuthUser } from "@/atom/authAtom";
import { setAuthAtom } from "@/atom/authAtom";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { signinSchema, type SigninFormData } from "@/lib/validationSchemas";

type SigninField = keyof SigninFormData;

type SigninResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export default function SigninForm() {
  const [formValues, setFormValues] = React.useState<SigninFormData>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = React.useState<Partial<Record<keyof SigninFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const setAuth = useSetAtom(setAuthAtom);
  const navigate = useNavigate();

  const handleChange =
    (field: SigninField) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: undefined,
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
      const validatedData = signinSchema.parse(formValues);

      const response = await apiRequest<SigninResponse, typeof validatedData>(
        "/auth/login/",
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
          const fieldErrors: Partial<Record<keyof SigninFormData, string>> = {};
          zodError.issues.forEach((issue) => {
            const field = issue.path[0] as keyof SigninFormData;
            fieldErrors[field] = issue.message;
          });
          setValidationErrors(fieldErrors);
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[44px] border border-rose-100 bg-white/95 shadow-2xl shadow-rose-200/50 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,214,165,0.35),transparent_65%)]" />
      <div className="relative grid overflow-hidden md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] p-10 text-white md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_70%)] opacity-80" />
          <div className="relative space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Welcome back
            </span>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Pick up the conversations that matter to you.
            </h1>
            <p className="max-w-sm text-sm text-white/85">
              Catch the latest updates from your circles, respond to new
              comments, and jump back into threads where your voice makes a
              difference.
            </p>
          </div>
          <ul className="relative space-y-4 text-sm text-white/90">
            <SigninFeature
              title="Live activity feed"
              description="See who mentioned you, which posts are trending, and where your attention is needed."
            />
            <SigninFeature
              title="Drafts on every device"
              description="Continue a post from mobile or desktop without losing your creative momentum."
            />
            <SigninFeature
              title="Community notifications"
              description="Real-time alerts from your favorite groups ensure you never miss a key moment."
            />
          </ul>
        </section>

        <section className="relative bg-white p-8 text-neutral-900 sm:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,214,165,0.2),transparent_60%)]" />
          <div className="relative space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#bc1888]">
              Sign in
            </span>
            <h2 className="text-2xl font-semibold text-neutral-900">
              Welcome back to JainSocials
            </h2>
            <p className="max-w-md text-sm text-neutral-500">
              Enter your email and password to continue shaping conversations and
              stay close to the communities you love.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="signinEmail">Email</Label>
              <Input
                id="signinEmail"
                placeholder="Enter your email address"
                type="email"
                value={formValues.email}
                onChange={handleChange("email")}
                autoComplete="email"
                className={validationErrors.email ? "border-red-500 focus:ring-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="signinPassword">Password</Label>
              <Input
                id="signinPassword"
                placeholder="Enter your password"
                type="password"
                value={formValues.password}
                onChange={handleChange("password")}
                autoComplete="current-password"
                className={validationErrors.password ? "border-red-500 focus:ring-red-500" : ""}
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </LabelInputContainer>

            <button
              className="group/btn relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-6 font-medium text-white shadow-lg shadow-rose-200/60 transition duration-300 hover:shadow-rose-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f09433]/60 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              <BottomGradient />
            </button>

            {error && (
              <p className="text-sm font-medium text-rose-500">{error}</p>
            )}

            <p className="text-center text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-[#bc1888] hover:text-[#f09433] transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

const SigninFeature = ({
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

