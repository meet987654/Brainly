import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Lock, User } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import axios, { AxiosError } from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface Position { x: number; y: number; }

interface AuthProps { onAuth?: (token: string) => void }

export default function Auth({ onAuth }: AuthProps) {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState<boolean>(true);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [autoGlowPosition, setAutoGlowPosition] = useState<Position>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  async function signup() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
      });

      setSuccess(response.data?.message || "Account created successfully! Please sign in.");
      setIsSignUp(false);
    } catch (err: any) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message || "Signup failed. Username may already exist.");
    } finally {
      setLoading(false);
    }
  }

  async function signin() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      if (onAuth) onAuth(response.data.token);
      setSuccess("Signin successful! Redirecting...");

      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err: any) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    let animationFrame: number;
    let time = 0;
    const animate = () => {
      if (!document.hidden) {
        time += 0.01;
        const x = window.innerWidth / 2 + Math.sin(time) * 300;
        const y = window.innerHeight / 2 + Math.cos(time * 0.8) * 200;
        setAutoGlowPosition({ x, y });
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleSubmit = () => {
    if (isSignUp) signup();
    else signin();
  };

  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setError("");
    setSuccess("");
    if (usernameRef.current) usernameRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex justify-center items-center relative overflow-hidden p-4">
      {/* Background glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(${isMobile ? '400px' : '600px'} circle at ${autoGlowPosition.x}px ${autoGlowPosition.y}px, rgba(139, 92, 246, 0.15), transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(${isMobile ? '250px' : '400px'} circle at ${autoGlowPosition.x}px ${autoGlowPosition.y}px, rgba(168, 85, 247, 0.1), transparent 60%)`,
        }}
      />
      {!isMobile && (
        <div
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.08), transparent 70%)`,
          }}
        />
      )}

      {/* Auth card */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl p-6 md:p-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="relative group mb-3 md:mb-4">
            <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl group-hover:bg-purple-500/30 transition-all duration-300"></div>
            <div className="relative p-3 md:p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg">
              <Brain className="text-white" size={isMobile ? 32 : 40} strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight text-center">
            {isSignUp ? "Join Brainly" : "Welcome Back"}
          </h1>
          <p className="text-gray-400 text-sm text-center">
            {isSignUp ? "Create your second brain today" : "Sign in to your account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg animate-shake">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm text-center">{success}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 z-10 pointer-events-none" size={20} />
            <Input ref={usernameRef} placeholder="Username" type="text" className="pl-12" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 z-10 pointer-events-none" size={20} />
            <Input ref={passwordRef} placeholder="Password" type="password" className="pl-12" />
          </div>
        </div>

        <Button
          variant="gradient"
          size="large"
          text={loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          loading={loading}
        />

        <div className="mt-6 text-center text-gray-500 text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={toggleMode} className="text-purple-400 hover:text-purple-300 font-semibold disabled:opacity-50" disabled={loading}>
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}