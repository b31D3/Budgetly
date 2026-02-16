import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, signOut } from "firebase/auth";
import { motion } from "framer-motion";

const authBubbles = [
  { size: 40, x: "5%",  y: "8%",  color: "bg-red-300/25", dur: 10, dx: 25,  dy: 18  },
  { size: 18, x: "20%", y: "4%",  color: "bg-red-200/30", dur: 7,  dx: -15, dy: 22  },
  { size: 55, x: "40%", y: "2%",  color: "bg-red-400/20", dur: 13, dx: 12,  dy: -14 },
  { size: 22, x: "65%", y: "6%",  color: "bg-red-300/28", dur: 8,  dx: -20, dy: 16  },
  { size: 35, x: "82%", y: "3%",  color: "bg-red-200/25", dur: 11, dx: 18,  dy: 20  },
  { size: 14, x: "92%", y: "18%", color: "bg-red-300/30", dur: 6,  dx: -12, dy: -18 },
  { size: 28, x: "96%", y: "45%", color: "bg-red-200/22", dur: 9,  dx: -16, dy: 14  },
  { size: 16, x: "93%", y: "70%", color: "bg-red-300/28", dur: 8,  dx: 14,  dy: -20 },
  { size: 44, x: "88%", y: "88%", color: "bg-red-400/18", dur: 12, dx: -10, dy: -16 },
  { size: 20, x: "55%", y: "92%", color: "bg-red-200/30", dur: 9,  dx: 18,  dy: -12 },
  { size: 30, x: "30%", y: "90%", color: "bg-red-300/22", dur: 11, dx: -14, dy: -18 },
  { size: 12, x: "10%", y: "88%", color: "bg-red-200/28", dur: 7,  dx: 20,  dy: -14 },
  { size: 24, x: "3%",  y: "60%", color: "bg-red-300/25", dur: 10, dx: 16,  dy: 12  },
  { size: 10, x: "6%",  y: "35%", color: "bg-red-200/32", dur: 6,  dx: -18, dy: 20  },
];

const AuthBubbles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {authBubbles.map((b, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${b.color}`}
        style={{ width: b.size, height: b.size, left: b.x, top: b.y }}
        animate={{
          x: [0, b.dx, -b.dx * 0.5, b.dx * 0.3, 0],
          y: [0, b.dy, -b.dy * 0.6, b.dy * 0.4, 0],
          scale: [1, 1.1, 0.92, 1.05, 1],
        }}
        transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // Clear the pending verification email from localStorage
    localStorage.removeItem("pendingVerificationEmail");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);

      // Check if email is verified
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        // Sign out the user
        await signOut(auth);
        toast.error(
          "Please verify your email before signing in. Check your inbox for the verification link.",
          {
            duration: 6000,
            action: {
              label: "Resend",
              onClick: async () => {
                try {
                  // Sign back in temporarily to resend email
                  const result = await signInWithEmail(email, password);
                  if (auth.currentUser) {
                    await sendEmailVerification(auth.currentUser);
                    await signOut(auth);
                    toast.success("Verification email sent! Check your inbox.");
                  }
                } catch (err) {
                  toast.error("Failed to resend verification email");
                }
              },
            },
          }
        );
        return;
      }

      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted relative overflow-hidden">
      <AuthBubbles />
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Link to="/" className="mb-4">
            <img src={logo} alt="Budgetly" className="h-12" />
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
};

export default SignIn;
