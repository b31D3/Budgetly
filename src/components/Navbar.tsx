import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Navbar = () => {
  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <img src={logo} alt="Budgetly" className="h-10 md:h-12" />

        {/* Sign in button */}
        <Button variant="signin" size="default" className="rounded-lg">
          Sign in
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
