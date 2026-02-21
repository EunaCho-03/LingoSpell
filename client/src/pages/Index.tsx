import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Languages, Zap, Upload, BookOpen, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";

const features = [
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Upload any PDF or video and get a clear, concise summary in seconds.",
  },
  {
    icon: Languages,
    title: "Instant Translation",
    description: "Translate your content into multiple languages with one click.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by AI, your results are ready before you finish your coffee.",
  },
];

const steps = [
  { icon: Upload, label: "Upload your file", detail: "PDF or video — just drag & drop." },
  { icon: BookOpen, label: "Get a summary", detail: "AI reads and condenses the key ideas." },
  { icon: Globe, label: "Translate it", detail: "Pick a language and get your translation." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative flex min-h-[85vh] items-center overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto grid gap-12 px-6 lg:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> AI-powered study tool
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Understand anything,{" "}
              <span className="text-primary">in any language.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Upload your lecture PDFs or videos and let AI summarize the key
              points and translate them — so you can study smarter, not harder.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/upload">
                <Button size="lg" className="gap-2 rounded-full px-8 text-base font-semibold shadow-[var(--shadow-soft)]">
                  <Upload className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base font-semibold"
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
              alt="Documents and translations floating in a warm atmosphere"
              className="w-full max-w-lg animate-float rounded-2xl"
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
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Everything you need to{" "}
            <span className="text-primary">ace your studies</span>
          </motion.h2>
          <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
            Simple, fast, and built for students who value their time.
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
                className="group rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
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
      <section id="how-it-works" className="bg-muted/40 py-24">
        <div className="container mx-auto px-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl"
          >
            Three steps. That's it.
          </motion.h2>

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
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-[var(--shadow-soft)]">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
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
              <Button size="lg" className="gap-2 rounded-full px-10 text-base font-semibold shadow-[var(--shadow-soft)]">
                <Upload className="h-4 w-4" />
                Try it now — it's free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudySnap. Built for students, by students.
        </div>
      </footer>
    </div>
  );
};

export default Index;
