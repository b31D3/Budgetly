import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (currentUser?.emailVerified) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    if (!currentUser) return;

    setResending(true);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth-action`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(currentUser, actionCodeSettings);
      toast.success("Verification email sent! Check your inbox.");
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait before trying again.");
      } else {
        toast.error("Failed to send verification email. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Please sign in first.</p>
              <Button onClick={() => navigate("/signin")}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification email to{" "}
              <span className="font-medium text-foreground">{currentUser.email}</span>.
              Please check your inbox and click the verification link.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Button>

              <Button
                onClick={handleRefresh}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I've verified my email
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={handleResendEmail}
                className="text-red-500 hover:underline"
                disabled={resending}
              >
                click here to resend
              </button>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
