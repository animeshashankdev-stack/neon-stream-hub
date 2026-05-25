import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import { AppShell } from "@/components/senpai/AppShell";
import { useMangaDetail, useMangaChapters } from "@/hooks/useManga";
import { useMangaProgress } from "@/hooks/useMangaProgress";

const MangaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading } = useMangaDetail(id);
  const { data: chapters } = useMangaChapters(id);
  const { data: progress } = useMangaProgress(id);

  // Sort chapters: if user is reading (has progress), show newest first, otherwise ascending
  const sortedChapters = useMemo(() => {
    if (!chapters) return [];
    
    // If user is actively reading (progress exists), show newest chapters first
    // This way newly added chapters appear at the top
    if (progress) {
      return [...chapters].reverse(); // Reverse to show newest first
    }
    
    // Otherwise show in ascending order (Ch 1, 2, 3, ...)
    return chapters;
  }, [chapters, progress]);

  return (
    <AppShell active="manga">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/manga" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-fuchsia-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {isLoading || !manga ? (
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-white/5 rounded-3xl" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 mb-10">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden bg-white/5 border border-white/10 max-w-sm shadow-2xl">
              {manga.cover ? (
                <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40">
                  <BookOpen className="w-12 h-12 text-white/30" />
                </div>
              )}
            </div>
            <div>
              <p className="senpai-mono text-[11px] uppercase tracking-[0.3em] text-fuchsia-300 font-bold mb-2">Manga Details</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight mb-4 leading-tight">{manga.title}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-6">
                {manga.year && <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"><Calendar className="w-3.5 h-3.5" />{manga.year}</span>}
                <span className="px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 uppercase tracking-widest font-bold text-fuchsia-300">{manga.status}</span>
              </div>
              <p className="text-white/70 leading-relaxed mb-6 max-w-3xl text-base">{manga.description?.slice(0, 600)}{manga.description?.length > 600 ? "…" : ""}</p>
              {manga.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {manga.tags.slice(0, 12).map((t) => (
                    <span key={t} className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center gap-1.5 hover:bg-white/10 hover:border-fuchsia-400/30 transition-all">
                      <Tag className="w-3 h-3" />{t}
                    </span>
                  ))}
                </div>
              )}
              {progress && (
                <Link
                  to={`/manga/${id}/${progress.chapter_id}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg hover:shadow-violet-500/30 mb-6"
                >
                  Continue Reading — Page {progress.page}
                </Link>
              )}
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-2">
              <span>Chapters</span>
              <span className="text-base font-mono text-white/50">({chapters?.length ?? 0})</span>
              {progress && <span className="text-xs px-2.5 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 font-bold">Reading</span>}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-2">
              {sortedChapters.map((c) => (
                <Link
                  key={c.id}
                  to={`/manga/${id}/${c.id}`}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-400/40 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold group-hover:text-fuchsia-300 transition-colors">Ch. {c.chapter}</p>
                    <p className="text-xs text-white/50 truncate group-hover:text-white/70">{c.title}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-white/5 text-white/40">{c.language}</span>
                </Link>
              ))}
              {sortedChapters.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-white/30" />
                  <p className="text-white/50">No English chapters found.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
};

export default MangaDetail;