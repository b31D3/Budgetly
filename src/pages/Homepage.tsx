import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Divider from "@/components/Divider";
import CalculatorFormImproved from "@/components/CalculatorFormImproved";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Divider */}
      <Divider />

      {/* Calculator Form */}
      <CalculatorFormImproved />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
