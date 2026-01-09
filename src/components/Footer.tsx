import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    // Simulate feedback submission (you can integrate with an actual backend later)
    setTimeout(() => {
      toast.success("Thank you for your feedback! We'll review it shortly.");
      setFeedback("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Top Section - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-8">
          {/* LEFT - Logo, Slogan, Products & Legal */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img src={logo} alt="Budgetly" className="h-8 mb-4" />
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              Empowering students to take control of their finances with smart budgeting tools and insights.
            </p>

            {/* Products and Legal in horizontal layout */}
            <div className="flex gap-12">
              {/* Product Links */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Products</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                      Calculator
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/scenarios" className="text-muted-foreground hover:text-foreground transition-colors">
                      scenarios
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms-of-use" className="text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Use
                    </Link>
                  </li>
                  <li>
                    <Link to="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">
                      Disclaimer
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block border-l border-border"></div>

          {/* RIGHT - Feedback Box */}
          <div className="flex-1 max-w-md lg:max-w-lg">
            <h3 className="font-semibold text-foreground text-lg mb-2 text-center">Help us improve</h3>
            <p className="text-muted-foreground text-sm text-center mb-4">
              Share your feedback or suggestions to help us make Budgetly better for you!
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <Textarea
                placeholder="Let us know what you think ......"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[80px] bg-white border-border resize-none rounded-xl text-sm"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-5"
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section - Data Handling & Copyright */}
        <div className="border-t border-border pt-6">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-foreground mb-2">Data handling & Privacy</h4>
            <p className="text-muted-foreground text-sm max-w-3xl mx-auto">
              Your financial data is stored securely using Firebase's industry-standard encryption. We never sell your personal information to third parties
            </p>
          </div>

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Budgetly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
