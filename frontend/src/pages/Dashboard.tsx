// src/pages/Dashboard.tsx
import { useEffect, useRef, useState } from "react";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";
import { ContentModal } from "../components/ui/ContentModal";
import { SideBar } from "../components/ui/SideBar";
import { ChevronDown, Twitter, Youtube, FileText, Image, Video, Menu } from "lucide-react";
import { useContent } from "../hooks/addContent";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface DashboardProps {
  onLogout?: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [autoGlowPosition, setAutoGlowPosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const scrollTicking = useRef(false);
  const mouseTicking = useRef(false);
  const { contents, loading, error, refresh } = useContent();
  const { show, ToastContainer } = useToast();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const typeLabelMap: Record<string, string> = {
    youtube: "YouTube",
    twitter: "Twitter",
    image: "Images",
    document: "Documents",
    text: "Text",
  };

  const displayedContents = selectedType ? contents.filter((c) => c.type === selectedType) : contents;
  const displayedCount = displayedContents.length;
  const displayedTitle = selectedType ? typeLabelMap[selectedType] || selectedType : "Your Content";

  const showSidebar = scrollProgress > 0.12;
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mouse tracking throttled with rAF
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseTicking.current) {
        mouseTicking.current = true;
        requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY });
          mouseTicking.current = false;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Subtle automatic background glow movement
  useEffect(() => {
    let animationFrame = 0;
    let time = 0;
    const animate = () => {
      if (!document.hidden) {
        time += 0.008;
        const x = window.innerWidth / 2 + Math.sin(time) * 400;
        const y = window.innerHeight / 2 + Math.cos(time * 0.8) * 300;
        setAutoGlowPosition({ x, y });
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Scroll progress (eased)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTicking.current) {
        scrollTicking.current = true;
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const windowHeight = window.innerHeight;
          const rawProgress = Math.min(scrollPosition / (windowHeight * 0.8), 1);
          const easedProgress =
            rawProgress < 0.5
              ? 4 * rawProgress * rawProgress * rawProgress
              : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;
          setScrollProgress(easedProgress);
          scrollTicking.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load existing share link for the user
  useEffect(() => {
    let mounted = true;
    (async function loadShare() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${BACKEND_URL}/api/v1/brain/share`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.share && data.hash) {
          setShareLink(`${window.location.origin}/share/${data.hash}`);
        }
      } catch (err) {
        // swallow — non-critical
        // (optionally: show("Failed to load share link", "error"))
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleShare = async () => {
    setShareLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      if (!shareLink) {
        const res = await fetch(`${BACKEND_URL}/api/v1/brain/share`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ share: true }),
        });

        if (!res.ok) throw new Error("Failed to create share link");
        const data = await res.json();
        const newLink = `${window.location.origin}/share/${data.hash}`;
        setShareLink(newLink);
        show("Share link created!", "success");
      } else {
        const res = await fetch(`${BACKEND_URL}/api/v1/brain/share`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ share: false }),
        });

        if (!res.ok) throw new Error("Failed to remove share link");
        setShareLink(null);
        show("Share link removed", "success");
      }
    } catch (err: any) {
      show(err?.message || "Failed to toggle share", "error");
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(
      () => show("Link copied to clipboard!", "success"),
      () => show("Copy failed", "error")
    );
  };

  const floatingIcons = [
    { Icon: FileText, bgColor: "bg-purple-500/70", position: { x: -300, y: -320 }, delay: 0, size: 30 },
    { Icon: Image, bgColor: "bg-blue-500/70", position: { x: -580, y: -50 }, delay: 1, size: 30 },
    { Icon: Video, bgColor: "bg-orange-500/70", position: { x: 500, y: -240 }, delay: 1.5, size: 30 },
    { Icon: Twitter, bgColor: "bg-cyan-500/70", position: { x: -270, y: 230 }, delay: 2, size: 30 },
    { Icon: Youtube, bgColor: "bg-yellow-500/70", position: { x: 270, y: 270 }, delay: 2.5, size: 30 },
  ];

  const heroCenter = { x: typeof window !== "undefined" ? window.innerWidth / 2 : 0, y: typeof window !== "undefined" ? window.innerHeight / 2 : 0 };
  const offsetX = (mousePosition.x - heroCenter.x) * 0.02;
  const offsetY = (mousePosition.y - heroCenter.y) * 0.02;

  const handleModalClose = () => {
    setModalOpen(false);
    refresh();
  };

  const handleDelete = async (contentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      show("Content deleted", "success");
      await refresh();
    } catch (err: any) {
      show(err?.message || "Delete failed", "error");
    }
  };

  // Unified logout: attempt backend logout (optional), always clear local token and redirect
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // backend logout is optional — backend may or may not implement it
        await fetch(`${BACKEND_URL}/api/v1/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          /* ignore network errors — we'll still clear local token */
        });
      }
    } finally {
      localStorage.removeItem("token");
      if (onLogout) onLogout();
      // Redirect user to auth/login route (your router has /auth)
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-t from-slate-950 via-black to-slate-900 font-sans relative">
      <ToastContainer />
      <ContentModal open={modalOpen} onClose={handleModalClose} />

      {/* Floating Hamburger Menu Button - Mobile Only */}
      {showSidebar && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-6 left-6 z-40 p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg text-white hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
          style={{ boxShadow: "0 4px 24px rgba(168,85,247,0.4)" }}
          aria-label="Open menu"
        >
          <Menu size={24} strokeWidth={2} />
        </button>
      )}

      {/* Background Glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 opacity-100"
        style={{
          background: `radial-gradient(800px circle at ${autoGlowPosition.x}px ${autoGlowPosition.y}px, rgba(139,92,246,0.15), transparent 80%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 opacity-100"
        style={{
          background: `radial-gradient(500px circle at ${autoGlowPosition.x}px ${autoGlowPosition.y}px, rgba(168,85,247,0.1), transparent 70%)`,
        }}
      />

      <div className={`flex transition-all duration-300 ${modalOpen ? "blur-sm" : ""}`}>
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div className="hidden md:block fixed left-0 top-0 bottom-0 z-20">
            <SideBar
              isOpen={sidebarOpen}
              selectedType={selectedType}
              onSelectType={(t) => setSelectedType(t)}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm">
            <SideBar
              isOpen
              selectedType={selectedType}
              onSelectType={(t) => {
                setSelectedType(t);
                setSidebarOpen(false);
              }}
              onToggle={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        <div
          className={`flex-1 relative z-10 transition-all duration-300 ${
            showSidebar ? (sidebarOpen ? "md:ml-76" : "md:ml-20") : "ml-0"
          }`}
        >
          {/* Hero Section */}
          <div
            className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 fixed top-0 right-0 transition-all duration-700 ease-out"
            style={{
              left: showSidebar ? (sidebarOpen ? "19rem" : "5rem") : "0",
              opacity: Math.pow(1 - scrollProgress, 2),
              transform: `translateY(-${scrollProgress * 120}px) scale(${1 - scrollProgress * 0.08})`,
              filter: `blur(${scrollProgress * 8}px)`,
              pointerEvents: scrollProgress > 0.9 ? "none" : "auto",
            }}
          >
            {isMounted && (
              <div
                className="absolute inset-0 pointer-events-none hidden sm:block"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                {floatingIcons.map((item, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${item.position.x}px)`,
                      top: `calc(50% + ${item.position.y}px)`,
                      transform: "translate(-50%, -50%)",
                      animation: `floatGroup 8s ease-in-out infinite`,
                      animationDelay: `${item.delay}s`,
                    }}
                  >
                    <div className={`p-3 sm:p-4 ${item.bgColor} rounded-xl shadow-md`}>
                      <item.Icon size={item.size} strokeWidth={1.5} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="max-w-3xl text-center relative z-10 px-4">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-8 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                Your Second Brain
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-3 sm:mb-6 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
                Capture, organize, and share your thoughts, ideas, and inspirations all in one beautiful place
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto" style={{ fontFamily: "Poppins, sans-serif" }}>
                Stop losing great ideas. Build your personal knowledge base with content from Twitter, YouTube, and more.
                Access everything instantly, share with your team, and never forget what matters.
              </p>
              <div className="mt-12 sm:mt-16 animate-bounce">
                <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto" />
                <p className="text-purple-300 text-xs sm:text-sm mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Scroll to explore
                </p>
              </div>
            </div>
          </div>

          <div className="h-screen" />

          {/* Main Content Section */}
          <div
            className="min-h-screen transition-all duration-700 ease-out"
            style={{
              opacity: scrollProgress,
              transform: `translateY(${(1 - scrollProgress) * 80}px) scale(${0.96 + scrollProgress * 0.04})`,
            }}
          >
            <div className="bg-black/10 backdrop-blur-lg border border-white/20 shadow-2xl p-4 sm:p-6 md:p-8 min-h-screen rounded-t-3xl">
              {/* Top Controls */}
              <div className="m-2 sm:m-4 relative">
                {/* Logout Button - Mobile */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden absolute top-0 right-0 px-3 py-1.5 bg-transparent border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-xs"
                >
                  Logout
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-12 sm:pt-0">
                  <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <Button variant="primary" size="medium" text="Add Content" startIcon={<PlusIcon size="medium" />} onClick={() => setModalOpen(true)} />

                    <Button
                      variant="secondary"
                      size="medium"
                      text={shareLoading ? "Loading..." : shareLink ? "Unshare Brain" : "Share Brain"}
                      startIcon={<ShareIcon size="medium" color="[&>*]:stroke-[#A855F7]" />}
                      onClick={toggleShare}
                      disabled={shareLoading}
                    />

                    {shareLink && (
                      <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-2 bg-slate-800/50 rounded-lg px-2 sm:px-3 py-1 border border-purple-500/30">
                        <input type="text" readOnly value={shareLink} className="bg-transparent text-white text-xs sm:text-sm outline-none w-full sm:w-64" />
                        <button onClick={copyShareLink} className="px-3 py-1.5 bg-purple-600 rounded text-white text-xs sm:text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto">
                          Copy
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Logout Button - Desktop */}
                  <button
                    onClick={handleLogout}
                    className="hidden sm:inline-flex items-center px-4 py-2 bg-transparent border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Content Title */}
              <div className="m-2 sm:m-4 mt-8 sm:mt-12 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {displayedTitle}
                  </h2>
                </div>
                <div>
                  <p className="text-gray-400 text-sm sm:text-base md:text-lg opacity-90">{loading ? "Loading your content..." : `${displayedCount} items saved`}</p>
                </div>
              </div>

              {/* Content Cards */}
              <div className="m-2 sm:m-4 flex gap-4 sm:gap-6 flex-wrap">
                {loading && (
                  <div className="w-full text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-500" />
                    <p className="text-gray-400 mt-4">Loading your content...</p>
                  </div>
                )}

                {error && (
                  <div className="w-full text-center py-12">
                    <p className="text-red-400">{error}</p>
                    <button onClick={refresh} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !error && displayedCount === 0 && (
                  <div className="w-full text-center py-10">
                    <p className="text-gray-400 text-base sm:text-lg">No content yet. Start adding some!</p>
                  </div>
                )}

                {!loading &&
                  !error &&
                  displayedContents.map((content: any) => (
                    <Card key={content._id} id={content._id} title={content.title} type={content.type} link={content.link} onDelete={handleDelete} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');

        html, body { scroll-behavior: smooth; overflow-x: hidden !important; }

        @keyframes bounce { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-8px); } }
        @keyframes floatGroup { 0%,100%{ transform: translate(-50%,-50%) translateY(0); } 50%{ transform: translate(-50%,-50%) translateY(-10px); } }
      `}</style>
    </div>
  );
}

export default Dashboard;
