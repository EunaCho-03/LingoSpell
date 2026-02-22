import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Languages, Zap, Upload, BookOpen, Globe, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "../LingoSpell_Img1-resized.png";
import lingoMascot from "../LingoSpell.png";

const features = [
  {
    icon: FileText,
    title: "Enchanted Summaries",
    description: "Upload any PDF or video and our magic conjures a clear, concise summary in seconds.",
  },
  {
    icon: Languages,
    title: "Translation Spells",
    description: "Translate your content into multiple languages with a single incantation.",
  },
  {
    icon: Zap,
    title: "Hopper Magic",
    description: "Powered by GEMINI and ElevenLabs, using a lucky rabbit.",
  },
];

const steps = [
  { icon: Upload, label: "Submit your scroll", detail: "PDF or video ... just drag & drop!" },
  { icon: BookOpen, label: "Receive the summary", detail: "AI reads and distills the key enchantments." },
  { icon: Globe, label: "Translate it", detail: "Pick a language and cast the spell." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const StarDecor = ({ className }: { className?: string }) => (
  <Star className={`text-primary fill-primary ${className}`} />
);

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative flex min-h-[85vh] items-center overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Decorative stars */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <StarDecor className="absolute top-20 left-[10%] h-4 w-4 animate-twinkle opacity-60" />
          <StarDecor className="absolute top-40 right-[15%] h-3 w-3 animate-twinkle opacity-40 [animation-delay:1s]" />
          <StarDecor className="absolute bottom-32 left-[20%] h-5 w-5 animate-twinkle opacity-50 [animation-delay:2s]" />
          <StarDecor className="absolute top-60 left-[60%] h-3 w-3 animate-twinkle opacity-30 [animation-delay:0.5s]" />
          <StarDecor className="absolute bottom-48 right-[25%] h-4 w-4 animate-twinkle opacity-50 [animation-delay:1.5s]" />
        </div>

        <div className="container mx-auto grid gap-12 px-6 lg:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered study magic
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-wide text-foreground sm:text-5xl lg:text-6xl">
              Understand anything,{" "}
              <span className="text-primary">in any language.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Upload your lecture scrolls or videos and let our enchanted AI
              summarize the key points and translate them. Study smarter, not harder.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/upload">
                <Button size="lg" className="glow-btn gap-2 rounded-full px-8 text-base font-semibold shadow-[var(--shadow-soft)]">
                  <Upload className="h-4 w-4" />
                  Begin Your Quest
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="glow-btn rounded-full border-primary/30 px-8 text-base font-semibold text-primary hover:bg-primary/10"
                >
                  How it works
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden items-center justify-center lg:flex"
          >
            <img
              src={heroImage}
              alt="Documents and translations floating in a magical atmosphere"
              className="w-full max-w-lg animate-float rounded-2xl drop-shadow-[0_0_40px_hsl(43_80%_55%/0.15)]"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl"
          >
            Everything you need to{" "}
            <span className="text-primary">master your studies</span>
          </motion.h2>
          <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
            Simple, powerful, and crafted for students who value their time.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="group glow-card rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-wide text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-secondary/30 py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl"
          >
            Three spells. That's it.
          </motion.h2>
          <div className="flex justify-center">
  <img
    src={lingoMascot}
    alt="Lingo Mascot"
    className="mx-auto mt-4 h-28 w-auto object-contain drop-shadow-[0_0_30px_hsl(43_80%_55%/0.35)]"
  />
</div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-primary text-primary-foreground text-xl font-bold shadow-[var(--shadow-soft)]">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-wide text-foreground">
                  {s.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={4}
            className="mt-14 text-center"
          >
            <Link to="/upload">
              <Button size="lg" className="glow-btn gap-2 rounded-full px-10 text-base font-semibold shadow-[var(--shadow-soft)]">
                <Sparkles className="h-4 w-4" />
                Cast your first spell — it's free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudySnap. Built for students, by students. ✨
        </div>
      </footer>
    </div>
  );
};

export default Index;
