import Navbar from "@/components/Navbar";
import CalculatorFormImproved from "@/components/CalculatorFormImproved";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CalculatorFormImproved />
    </div>
  );
};

export default Calculator;
