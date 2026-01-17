"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Loader2, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/lib/auth-client";

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = useMemo((): PasswordRequirement[] => {
    return [
      { text: "At least 8 characters", met: password.length >= 8 },
      { text: "One uppercase letter", met: /[A-Z]/.test(password) },
      { text: "One lowercase letter", met: /[a-z]/.test(password) },
      { text: "One number", met: /[0-9]/.test(password) },
    ];
  }, [password]);

  const passwordStrength = useMemo(() => {
    const metCount = passwordRequirements.filter((req) => req.met).length;
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (metCount <= 1) return { label: "Weak", color: "bg-[#DC2626]", width: "25%" };
    if (metCount === 2) return { label: "Fair", color: "bg-[#EA580C]", width: "50%" };
    if (metCount === 3) return { label: "Good", color: "bg-[#EAB308]", width: "75%" };
    return { label: "Strong", color: "bg-[#16A34A]", width: "100%" };
  }, [passwordRequirements, password]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate full name
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name: fullName,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed. Please try again.");
      } else {
        // Registration successful, redirect to home/dashboard
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An error occurred during registration. Please try again.");
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
                Create your account
              </CardTitle>
              <CardDescription className="text-[#525252]">
                Get started with AI Agency PM in minutes
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
                <Label htmlFor="fullName" className="text-[#171717] text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-[#E5E5E5] focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B] transition-colors h-11"
                />
              </div>

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
                <Label htmlFor="password" className="text-[#171717] text-sm font-medium">
                  Password
                </Label>
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#525252]">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.label === "Strong" ? "text-[#16A34A]" :
                        passwordStrength.label === "Good" ? "text-[#EAB308]" :
                        passwordStrength.label === "Fair" ? "text-[#EA580C]" :
                        "text-[#DC2626]"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {password && (
                  <div className="space-y-1.5 mt-3 p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check className="h-3.5 w-3.5 text-[#16A34A] flex-shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-[#A3A3A3] flex-shrink-0" />
                        )}
                        <span className={req.met ? "text-[#16A34A]" : "text-[#525252]"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#171717] text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-[#E5E5E5] focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B] transition-colors pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#525252] transition-colors"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-[#DC2626] flex items-center gap-1.5 mt-1.5">
                    <X className="h-3 w-3" />
                    Passwords don&apos;t match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-[#16A34A] flex items-center gap-1.5 mt-1.5">
                    <Check className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
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
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E5E5]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#A3A3A3]">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link href="/login" className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors h-11 font-medium"
                >
                  Sign in instead
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-[#A3A3A3] mt-6">
          By creating an account, you agree to our{" "}
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
