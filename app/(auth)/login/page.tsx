"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(
    errorParam === "service_unavailable"
      ? "Service temporarily unavailable. Please try again in a few moments."
      : ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
      } else {
        // Redirect to the intended page or dashboard
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-[#E5E5E5] shadow-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#18181B]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#171717]">AI Agency PM</h1>
                <p className="text-xs text-[#A3A3A3]">Project Management System</p>
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-[#171717]">
                Welcome back
              </CardTitle>
              <CardDescription className="text-[#525252]">
                Sign in to your account to continue
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-[#FEF2F2] p-4 text-sm text-[#DC2626] border border-[#DC2626]/20 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="flex-1">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#171717] text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-[#E5E5E5] focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B] transition-colors h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#171717] text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#525252] hover:text-[#171717] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-[#E5E5E5] focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B] transition-colors pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#525252] transition-colors"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-[#E5E5E5] text-[#18181B] focus:ring-2 focus:ring-[#18181B] focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-[#525252] font-normal cursor-pointer"
                >
                  Keep me signed in
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#18181B] text-white hover:bg-[#27272A] transition-colors h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E5E5]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#A3A3A3]">
                    New to AI Agency PM?
                  </span>
                </div>
              </div>

              <Link href="/register" className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors h-11 font-medium"
                >
                  Create an account
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-[#A3A3A3] mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-[#525252] hover:text-[#171717] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#525252] hover:text-[#171717] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
