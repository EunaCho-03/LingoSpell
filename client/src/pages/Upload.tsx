import { useState, useCallback, useEffect } from "react";
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
  //{ value: "bn", label: "Bengali"},
];

const SPEAKER_OPTIONS = ["1", "2", "3", "4", "5+"];

const LOADING_MESSAGES = [
  "🤖 Let me listen carefully…",
  "🧠 Translating thoughts across languages…",
  "🎙️ Giving your video a new voice…",
  "📄 Writing things down neatly…",
  "✨ Making it easy to understand…",
  "🚀 Almost done! Hang tight…",
];

type SummaryResult = {
  transcript: string;
  summary: string;
  explanation: string;
};

const API_BASE = "http://127.0.0.1:5050"; // ✅ 백엔드 주소

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [targetLang, setTargetLang] = useState("es");
  const [speakers, setSpeakers] = useState("1");

  // ✅ 결과 표시용 state 추가
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);

  // ✅ 로딩 단계용 state
  const [loadingStep, setLoadingStep] = useState(0);

  const { toast } = useToast();

  // ✅ videoUrl 메모리 누수 방지 (새 URL 만들면 이전 URL 해제)
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!processing) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 2500); // 2.5초마다 메시지 변경

    return () => clearInterval(interval);
  }, [processing]);

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

      // ✅ 새 파일 선택하면 이전 결과 초기화
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
      setSummaryResult(null);
    },
    [toast, videoUrl]
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

    try {
      const formData = new FormData();
      formData.append("file", file);

      let endpoint = "";

      if (file.type === "application/pdf") {
        // ✅ PDF endpoint는 너 프로젝트에 맞게 유지
        endpoint = "/api/summarize-pdf";

        // 보통 백엔드가 target_lang을 기대하므로 여기도 통일 추천
        formData.append("target_lang", targetLang);
      } else if (file.type.startsWith("video/")) {
        // ✅ 백엔드가 현재 /api/process 하나만 있으니까 여기로
        endpoint = `${API_BASE}/api/process`;

        // ✅ 백엔드 main.py가 읽는 key 이름들
        formData.append("target_lang", targetLang);
        formData.append("source_lang", "en"); // 또는 "auto" (ElevenLabs가 지원하면)

        // speakers는 지금 백엔드가 안 쓰지만, 보내도 문제 없음
        formData.append("speakers", speakers);
      } else {
        throw new Error("Unsupported file type");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to process file");
      }

      // ✅ PDF 처리 결과는 너 백엔드 형태에 따라 다름 (여기선 콘솔만)
      if (file.type === "application/pdf") {
        toast({ title: "Success!", description: "PDF processed." });
        console.log("PDF response:", data);
        return;
      }

      // ✅ VIDEO: summary 저장
      setSummaryResult(data.summary);

      // ✅ VIDEO: base64 mp4 -> Blob URL 만들어 재생
      const b64: string | undefined = data.dubbed_mp4_base64;
      if (!b64) {
        throw new Error("Backend did not return dubbed_mp4_base64");
      }

      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      toast({
        title: "Success!",
        description: "Dubbed video & summary ready.",
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
                  onClick={() => {
                    setFile(null);
                    if (videoUrl) URL.revokeObjectURL(videoUrl);
                    setVideoUrl(null);
                    setSummaryResult(null);
                  }}
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

              {/* ✅ 결과 영역: VIDEO */}
              {videoUrl && (
                <div className="mt-6 rounded-xl border border-border bg-card p-4">
                  <p className="mb-2 text-sm font-medium text-foreground">Dubbed Video</p>
                  <video src={videoUrl} controls className="w-full rounded-lg" />
                </div>
              )}

              {/* ✅ 결과 영역: SUMMARY */}
              {summaryResult && (
                <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Transcript</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {summaryResult.transcript}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Summary</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {summaryResult.summary}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Explanation</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {summaryResult.explanation}
                    </p>
                  </div>
                </div>
              )}
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
      {/* ✅ Loading Overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[90%] max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              {/* 상단: 스피너 + 메시지 */}
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {LOADING_MESSAGES[loadingStep]}
                </p>
              </div>

              {/* 설명 */}
              <p className="mt-3 text-xs text-muted-foreground">
                This may take a minute depending on video length.
              </p>

              {/* 진행 바 (가짜지만 안정감 줌) */}
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((loadingStep + 1) / LOADING_MESSAGES.length) * 100}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;