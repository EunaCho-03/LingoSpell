import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Film, X, Loader2, Sparkles, Languages, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/quicktime": [".mov"],
};

const LANGUAGES = [
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
];

const SPEAKER_OPTIONS = ["1", "2", "3", "4", "5+"];

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [targetLang, setTargetLang] = useState("es");
  const [speakers, setSpeakers] = useState("1");
  const { toast } = useToast();

  const handleFile = useCallback(
    (f: File) => {
      const validTypes = Object.keys(ACCEPTED);
      if (!validTypes.includes(f.type)) {
        toast({
          title: "Unsupported file",
          description: "Please upload a PDF or video file (MP4, WebM, MOV).",
          variant: "destructive",
        });
        return;
      }
      setFile(f);
    },
    [toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    // TODO: connect to backend
     try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLang", targetLang);

    let endpoint = "";

    // 🔎 Check file type BEFORE making request
    if (file.type === "application/pdf") {
      endpoint = "/api/summarize-pdf";
    } else if (file.type.startsWith("video/")) {
      endpoint = "/api/dub";
      formData.append("speakers", speakers);
    } else {
      throw new Error("Unsupported file type");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to process file");
    }

    const data = await response.json();

    toast({
      title: "Success!",
      description: "Your file is being processed.",
    });

    console.log("Backend response:", data);
  } catch (error: any) {
    console.error(error);

    toast({
      title: "Processing failed",
      description: error.message || "Something went wrong.",
      variant: "destructive",
    });
  } finally {
    setProcessing(false);
  }
  };

  const isPdf = file?.type === "application/pdf";
  const isVideo = file?.type.startsWith("video/");

  return (
    <div className="container mx-auto max-w-2xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Upload your file
        </h1>
        <p className="mt-2 text-muted-foreground">
          Drop a PDF or video and we'll summarize & translate it for you.
        </p>

        {/* Drop zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/40"
          }`}
        >
          <input
            type="file"
            className="hidden"
            accept=".pdf,.mp4,.webm,.mov"
            onChange={onInputChange}
          />
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <span className="font-medium text-foreground">
            Drag & drop or click to browse
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            PDF, MP4, WebM, or MOV
          </span>
        </label>

        {/* File preview */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {isPdf ? (
                    <FileText className="h-5 w-5" />
                  ) : isVideo ? (
                    <Film className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={() => setShowOptions(true)}
                disabled={processing}
                size="lg"
                className="mt-5 w-full gap-2 rounded-full text-base font-semibold shadow-[var(--shadow-soft)]"
              >
                <Sparkles className="h-4 w-4" />
                Summarize & Translate
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Options Modal */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              Processing Options
            </DialogTitle>
            <DialogDescription>
              Configure how you'd like your file processed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Target Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                Target Language
              </Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of Speakers (video only) */}
            {isVideo && (
              <div className="space-y-2">
                <Label htmlFor="speakers" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Number of Speakers
                </Label>
                <Select value={speakers} onValueChange={setSpeakers}>
                  <SelectTrigger id="speakers" className="w-full">
                    <SelectValue placeholder="Select speakers" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEAKER_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n} {n === "1" ? "speaker" : "speakers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOptions(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowOptions(false);
                handleProcess();
              }}
              disabled={processing}
              className="gap-2 rounded-full"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadPage;
