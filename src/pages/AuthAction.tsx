import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, KeyRound } from "lucide-react";

type ActionMode = "verifyEmail" | "resetPassword" | "recoverEmail" | null;

const AuthAction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<ActionMode>(null);

  // Password reset states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [validResetCode, setValidResetCode] = useState(false);

  const oobCode = searchParams.get("oobCode");
  const actionMode = searchParams.get("mode") as ActionMode;

  useEffect(() => {
    const handleAction = async () => {
      if (!oobCode) {
        setError("Invalid action link. Please request a new one.");
        setLoading(false);
        return;
      }

      setMode(actionMode);

      try {
        switch (actionMode) {
          case "verifyEmail":
            await applyActionCode(auth, oobCode);
            setSuccess(true);
            toast.success("Email verified successfully!");
            break;

          case "resetPassword":
            // Verify the code is valid
            await verifyPasswordResetCode(auth, oobCode);
            setValidResetCode(true);
            break;

          case "recoverEmail":
            await applyActionCode(auth, oobCode);
            setSuccess(true);
            toast.success("Email recovered successfully!");
            break;

          default:
            setError("Unknown action type.");
        }
      } catch (err: any) {
        console.error("Auth action error:", err);
        if (err.code === "auth/expired-action-code") {
          setError("This link has expired. Please request a new one.");
        } else if (err.code === "auth/invalid-action-code") {
          setError("This link is invalid or has already been used. Please request a new one.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    handleAction();
  }, [oobCode, actionMode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!oobCode) {
      toast.error("Invalid reset link");
      return;
    }

    setResettingPassword(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setPasswordResetSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/expired-action-code") {
        setError("This link has expired. Please request a new password reset.");
      } else if (err.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setResettingPassword(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 pb-8 text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Processing your request...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/signin")}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Go to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Password reset form
  if (mode === "resetPassword" && validResetCode && !passwordResetSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-center mb-2">Reset your password</h1>
              <p className="text-muted-foreground text-center mb-6">
                Enter your new password below.
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1"
                    minLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={resettingPassword}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  {resettingPassword ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Password reset success
  if (mode === "resetPassword" && passwordResetSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password reset successful!</h1>
              <p className="text-muted-foreground mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Button
                onClick={() => navigate("/signin")}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Email verification success
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {mode === "verifyEmail" ? "Email verified!" : "Action completed!"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {mode === "verifyEmail"
                  ? "Your email has been verified successfully. You can now access all features."
                  : "Your request has been processed successfully."}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/signin")}
                  variant="outline"
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-muted-foreground">Processing...</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AuthAction;
