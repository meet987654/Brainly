import React, { useEffect, useRef, useState } from "react";
import { ShareIcon } from "../../icons/ShareIcon";
import { useToast } from "./Toast";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "image" | "document" | "text";
  id?: string;
  body?: string;
  filename?: string;
  onDelete?: (id: string) => Promise<void> | void;
}

export function Card({ title, link, type, id, body, filename, onDelete }: CardProps) {
  const tweetRef = useRef<HTMLDivElement | null>(null);
  const modalTweetRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { show } = useToast();

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const patterns = [/(?:v=|v\/|embed\/|youtu.be\/|\/v\/)([\w-]{11})/, /([\w-]{11})/];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  };

  const videoId = type === "youtube" ? getYouTubeId(link) : null;
  const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : link.replace("watch", "embed").replace("?v=", "/");
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const isPdf = /\.pdf(?:\?|$)/i.test(link);

  useEffect(() => {
    if (type === "twitter") {
      const loadTwitterWidget = () => {
        if ((window as any).twttr && tweetRef.current) {
          try {
            (window as any).twttr.widgets.load(tweetRef.current);
            if (modalTweetRef.current) (window as any).twttr.widgets.load(modalTweetRef.current);
            return;
          } catch (e) {
            // fallthrough to append script
          }
        }

        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      };

      loadTwitterWidget();
    }
  }, [type, link]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !onDelete) return;
    const ok = confirm("Delete this content?");
    if (!ok) return;
    try {
      await onDelete(id);
    } catch (err: any) {
      console.error("Failed to delete", err);
      show(err?.message || "Delete failed", "error");
    }
  };

  return (
    <>
      <div
        className="group relative p-5 h-56 w-72 bg-gradient-to-t from-purple-900 via-slate-900 to-indigo-950 backdrop-blur-xl border border-purple-700 rounded-2xl shadow-lg hover:shadow-purple-800 hover:scale-[1.02] hover:border-purple-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer overflow-hidden flex flex-col"
        onClick={() => setIsExpanded(true)}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/40 via-fuchsia-500/30 to-indigo-500/40 opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-2xl" />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 text-md text-gray-200">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700/30 text-purple-300 shadow-sm">
              <ShareIcon size="medium" />
            </span>
            <div className="font-semibold truncate max-w-[10rem]">{title}</div>
          </div>

          <div className="flex items-center gap-2">
            {id && onDelete && (
              <button 
                onClick={handleDelete} 
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400 group/delete" 
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 flex-1 min-h-0 overflow-hidden" ref={type === "twitter" ? tweetRef : null}>
          {type === "youtube" && (
            <div className="w-full h-full overflow-hidden rounded-xl border border-purple-700/40 shadow-md pointer-events-none">
              {thumb ? (
                <div className="w-full h-full bg-center bg-cover relative" style={{ backgroundImage: `url(${thumb})` }}>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="rounded-full bg-white/90 w-14 h-14 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {type === "twitter" && (
            <div className="relative h-full">
              <blockquote className="twitter-tweet" data-theme="dark" data-conversation="none" data-cards="hidden">
                <a href={link.replace("x.com", "twitter.com")}></a>
              </blockquote>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-900" />
            </div>
          )}

          {type === "image" && (
            <div className="w-full rounded-xl overflow-hidden border border-purple-700/40 shadow-md">
              <img src={link} alt={title} className="w-full object-cover" />
            </div>
          )}

          {type === "document" && (
            <div className="w-full rounded-xl overflow-hidden border border-purple-700/40 shadow-md">
              {isPdf ? <iframe src={link} title={title} className="w-full h-64" /> : <a href={link} target="_blank" rel="noopener noreferrer" className="text-purple-400">Open document</a>}
            </div>
          )}

          {type === "text" && (
            <div className="w-full rounded-xl overflow-auto border border-purple-700/40 shadow-md p-4 max-h-64 text-gray-200">
              <div>{body || ""}</div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setIsExpanded(false)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] bg-gradient-to-t from-purple-900 via-slate-900 to-indigo-950 backdrop-blur-xl border border-purple-500 rounded-2xl shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 right-0 z-10 flex justify-end gap-2 p-4 bg-gradient-to-b from-slate-900/80 to-transparent">
              {id && onDelete && (
                <button 
                  onClick={handleDelete} 
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400" 
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button onClick={() => setIsExpanded(false)} className="p-2 bg-purple-800/80 hover:bg-purple-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 -mt-8">
              <div className="flex items-center gap-3 text-md text-gray-200 mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700/30 text-purple-300 shadow-sm">
                  <ShareIcon size="medium" />
                </span>
                <div className="font-semibold text-lg">{title}</div>
              </div>

              <div className="space-y-4">
                {type === "youtube" && (
                  <div className="w-full overflow-hidden rounded-xl border border-purple-700/40 shadow-md">
                    {!isPlaying && thumb ? (
                      <div className="w-full aspect-video bg-center bg-cover relative cursor-pointer" style={{ backgroundImage: `url(${thumb})` }} onClick={() => setIsPlaying(true)} aria-hidden>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="rounded-full bg-white/90 w-14 h-14 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <iframe className="w-full aspect-video" src={embedSrc} title={title || "YouTube video player"} frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                    )}
                  </div>
                )}

                {type === "twitter" && (
                  <div ref={modalTweetRef as any}>
                    <blockquote className="twitter-tweet" data-theme="dark">
                      <a href={link.replace("x.com", "twitter.com")}></a>
                    </blockquote>
                  </div>
                )}

                {type === "image" && (
                  <div className="w-full rounded-xl overflow-hidden border border-purple-700/40 shadow-md">
                    <img src={link} alt={title} className="w-full object-cover" />
                  </div>
                )}

                {type === "document" && (
                  <div className="w-full rounded-xl overflow-hidden border border-purple-700/40 shadow-md">
                    {isPdf ? <iframe src={link} title={title} className="w-full h-96" /> : <a href={link} target="_blank" rel="noopener noreferrer" className="text-purple-400">Open document</a>}
                  </div>
                )}

                {type === "text" && (
                  <div className="w-full rounded-xl overflow-auto border border-purple-700/40 shadow-md p-4 text-gray-200 whitespace-pre-wrap">
                    {body || ""}
                  </div>
                )}

                {filename && (
                  <div className="text-sm text-gray-400">File: {filename}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}