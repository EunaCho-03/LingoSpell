import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-foreground">
            LingoSpell
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {location.pathname !== "/upload" ? (
            <Link to="/upload">
              <Button size="sm" className="glow-btn gap-2 rounded-full font-medium">
                <FileText className="h-4 w-4" />
                Upload File
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full font-medium">
                Back to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
