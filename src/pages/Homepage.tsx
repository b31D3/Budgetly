import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Divider from "@/components/Divider";
import CalculatorFormImproved from "@/components/CalculatorFormImproved";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Divider */}
      <Divider />

      {/* Calculator Form */}
      <CalculatorFormImproved />
    </div>
  );
};

export default Homepage;
