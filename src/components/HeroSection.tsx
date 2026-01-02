import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";
const HeroSection = () => {
  const scrollToCalculator = () => {
    const element = document.getElementById("calculator");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section className="w-full bg-background py-0 md:py-0 lg:py-0">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8 animate-fade-in ml-6">
            {/* Main headline */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-[#333333]">
              Know what your degree cost you before you graduate
            </h1>

            {/* Subtext */}
            <p className="text-lg lg:text-xl text-body leading-relaxed max-w-xl">
              Stop guessing if you'll make it to graduation. See your exact financial path and how every decision moves you closer to debt-free or deeper in the hole.
            </p>

            {/* See the full picture section */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                See the full picture
              </p>
              <p className="text-muted-foreground">
                Plan your finances from enrollment to graduation
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4 pt-4">
              <Button variant="cta-circle" size="icon-xl" onClick={scrollToCalculator} className="animate-bounce-subtle">
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Get started</span>
                <span className="text-sm text-muted-foreground">no sign-up required</span>
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="w-full flex items-center justify-end overflow-hidden animate-fade-in order-first md:order-last" style={{
          animationDelay: "0.2s"
        }}>
            <img src={heroIllustration} alt="Budgetly financial planning journey - from inputs to graduation" className="w-full h-auto max-w-lg lg:max-w-xl translate-x-3" />
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;