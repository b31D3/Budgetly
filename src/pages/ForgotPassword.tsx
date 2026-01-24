import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/signin`,
        handleCodeInApp: false,
      });
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email address");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Please enter a valid email address");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait before trying again.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/signin`,
        handleCodeInApp: false,
      });
      toast.success("Password reset email sent again! Check your inbox.");
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait before trying again.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8">
            {!emailSent ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">
                  Forgot your password?
                </h1>
                <p className="text-muted-foreground text-center mb-6">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/signin"
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">
                  Check your email
                </h1>
                <p className="text-muted-foreground text-center mb-6">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Please check your inbox and click the link to reset your
                  password.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? "Sending..." : "Resend email"}
                  </Button>

                  <Button
                    onClick={() => navigate("/signin")}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    Back to sign in
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center mt-6">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={handleResendEmail}
                    className="text-red-500 hover:underline"
                    disabled={loading}
                  >
                    click here to resend
                  </button>
                  .
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
