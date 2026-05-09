import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useMangaDetail, useMangaChapters } from "@/hooks/useManga";
import { useMangaProgress } from "@/hooks/useMangaProgress";

const MangaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading } = useMangaDetail(id);
  const { data: chapters } = useMangaChapters(id);
  const { data: progress } = useMangaProgress(id);

  return (
    <div className="min-h-screen bg-[#080818] text-white pb-24 md:pb-10 font-body">
      <Navbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto">
        <Link to="/manga" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to manga
        </Link>

        {isLoading || !manga ? (
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-white/5 rounded-2xl" />
          </div>
        ) : (
          <div className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-10">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 max-w-xs">
              {manga.cover ? (
                <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-white/30" /></div>
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mb-3">{manga.title}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-4">
                {manga.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{manga.year}</span>}
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest">{manga.status}</span>
              </div>
              <p className="text-white/70 leading-relaxed mb-4 max-w-2xl whitespace-pre-line">{manga.description?.slice(0, 600)}{manga.description?.length > 600 ? "…" : ""}</p>
              {manga.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {manga.tags.slice(0, 12).map((t) => (
                    <span key={t} className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{t}
                    </span>
                  ))}
                </div>
              )}
              {progress && (
                <Link
                  to={`/manga/${id}/${progress.chapter_id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-black font-bold text-sm hover:bg-accent/80 transition-colors mb-4"
                >
                  Resume — page {progress.page}
                </Link>
              )}
            </div>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-display font-bold mb-4">Chapters {chapters ? `(${chapters.length})` : ""}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {(chapters || []).map((c) => (
              <Link
                key={c.id}
                to={`/manga/${id}/${c.id}`}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">Ch. {c.chapter}</p>
                  <p className="text-xs text-white/50 truncate">{c.title}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-white/40">{c.language}</span>
              </Link>
            ))}
            {chapters?.length === 0 && <p className="text-white/50 text-sm">No English chapters found.</p>}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default MangaDetail;