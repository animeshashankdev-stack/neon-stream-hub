import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Layout } from "lucide-react";
import { useChapterPages, useMangaChapters } from "@/hooks/useManga";
import { useSaveMangaProgress } from "@/hooks/useMangaProgress";

const MangaReader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const { data: pages, isLoading } = useChapterPages(chapterId);
  const { data: chapters } = useMangaChapters(id);
  const save = useSaveMangaProgress();
  const [mode, setMode] = useState<"vertical" | "paged">("vertical");
  const [pageIdx, setPageIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Progress save (debounced via interval)
  useEffect(() => {
    if (!id || !chapterId || !pages?.length) return;
    const t = setInterval(() => {
      save({ mangaId: id, chapterId, page: pageIdx + 1, totalPages: pages.length }).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [id, chapterId, pageIdx, pages?.length, save]);

  // Vertical scroll: detect current page
  useEffect(() => {
    if (mode !== "vertical") return;
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const imgs = el.querySelectorAll<HTMLImageElement>("img[data-page]");
      const mid = window.scrollY + window.innerHeight / 2;
      let cur = 0;
      imgs.forEach((img, i) => {
        const top = img.getBoundingClientRect().top + window.scrollY;
        if (top < mid) cur = i;
      });
      setPageIdx(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, pages?.length]);

  const chapterIndex = chapters?.findIndex((c) => c.id === chapterId) ?? -1;
  const prevChapter = chapterIndex > 0 ? chapters?.[chapterIndex - 1] : null;
  const nextChapter = chapterIndex >= 0 && chapters && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3">
        <Link to={`/manga/${id}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="text-xs text-white/60">
          {pages ? `${pageIdx + 1} / ${pages.length}` : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode((m) => (m === "vertical" ? "paged" : "vertical"))}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5"
          >
            <Layout className="w-3.5 h-3.5" />
            {mode === "vertical" ? "Paged" : "Webtoon"}
          </button>
        </div>
      </header>

      {/* Reader */}
      <div ref={containerRef} className={mode === "vertical" ? "max-w-3xl mx-auto" : "min-h-[80vh] flex items-center justify-center px-4"}>
        {mode === "vertical"
          ? (pages || []).map((src, i) => (
              <img
                key={i}
                data-page={i}
                src={src}
                alt={`Page ${i + 1}`}
                loading={i < 3 ? "eager" : "lazy"}
                className="w-full h-auto block pointer-events-none"
              />
            ))
          : pages?.[pageIdx] && (
              <div className="relative max-h-[85vh]">
                <img src={pages[pageIdx]} alt={`Page ${pageIdx + 1}`} className="max-h-[85vh] w-auto pointer-events-none" />
                <button
                  onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                  className="absolute left-0 top-0 h-full w-1/3 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 bg-gradient-to-r from-black/50 to-transparent transition-opacity"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setPageIdx((p) => Math.min((pages?.length || 1) - 1, p + 1))}
                  className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 bg-gradient-to-l from-black/50 to-transparent transition-opacity"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            )}
      </div>

      {/* Bottom chapter nav */}
      <footer className="sticky bottom-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
        <button
          disabled={!prevChapter}
          onClick={() => prevChapter && navigate(`/manga/${id}/${prevChapter.id}`)}
          className="px-4 py-2 rounded-full bg-white/10 disabled:opacity-30 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <div className="text-[11px] text-white/50 truncate">Ch. {chapters?.[chapterIndex]?.chapter ?? "?"}</div>
        <button
          disabled={!nextChapter}
          onClick={() => nextChapter && navigate(`/manga/${id}/${nextChapter.id}`)}
          className="px-4 py-2 rounded-full bg-accent text-black disabled:opacity-30 hover:bg-accent/80 text-xs font-bold flex items-center gap-1.5"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </footer>
    </div>
  );
};

export default MangaReader;