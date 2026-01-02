import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Divider from "@/components/Divider";
import CalculatorForm from "@/components/CalculatorForm";

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
      <CalculatorForm />
    </div>
  );
};

export default Homepage;
