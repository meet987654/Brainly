import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth"; // ✅ capitalized import
import SharedView from "./pages/SharedView";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  // derive login state from localStorage token presence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("token"));

  // keep state in sync if other tabs update auth
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "token") setIsLoggedIn(!!e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Auth onAuth={(t: string) => setIsLoggedIn(!!t)} />} />
          <Route path="/auth" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Auth onAuth={(t: string) => setIsLoggedIn(!!t)} />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          <Route path="/share/:hash" element={<SharedView />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
