import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import lingoMascot from "./pngimg.com_-_wand_PNG14-removebg-preview.png";
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
        
        <Link to="/" className="flex items-center h-full gap-2">
  <span className="text-yellow-400 font-extrabold text-xl tracking-wider drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]">
    Lingo Spell
  </span>
  <img
    src={lingoMascot}
    alt="Lingo Mascot"
    className="h-8 w-auto object-contain"
  />
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
