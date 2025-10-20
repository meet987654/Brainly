import axios from "axios";
import { useEffect, useState } from "react";

// Define the Content type based on your Card component expectations
export interface Content {
  _id?: string;
  title: string;
  type: "youtube" | "twitter" | "image" | "document" | "text";
  link: string;
  tags?: string[];
  userId?: string;
  createdAt?: string;
}

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://brainly-7s68.onrender.com/";

export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch contents
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const raw: any[] = response.data.contents || [];

      // normalize and infer type when missing
      const normalized: Content[] = raw.map((c) => {
        const link: string = c.link || '';
        let type: Content['type'] = c.type;
        if (!type) {
          if (/youtu(?:\.be|be\.com)\/.+|v=/.test(link)) type = 'youtube';
          else if (/twitter|x\.com/.test(link)) type = 'twitter';
          else if (/\.(png|jpe?g|gif|webp|svg)(?:\?|$)/i.test(link)) type = 'image';
          else if (/\.(pdf|docx?|txt)(?:\?|$)/i.test(link)) type = 'document';
          else if (c.body) type = 'text';
          else type = 'youtube';
        }
        return { ...c, type } as Content;
      });

      setContents(normalized);
    } catch (err) {
      console.error("Error fetching contents:", err);
      setError("Failed to fetch contents");
    } finally {
      setLoading(false);
    }
  };

  // Function to add new content
  const addContent = async (content: Omit<Content, "_id" | "userId" | "createdAt"> & Partial<{ body: string; filename: string; mime: string }>) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(`${BACKEND_URL}/api/v1/content`, content, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add the new content to the state
      setContents((prev) => [...prev, response.data.content]);
      return response.data;
    } catch (err) {
      console.error("Error adding content:", err);
      throw err;
    }
  };

  // Function to delete content
  const deleteContent = async (contentId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove the deleted content from state
      setContents((prev) => prev.filter((c) => c._id !== contentId));
    } catch (err) {
      console.error("Error deleting content:", err);
      throw err;
    }
  };

  // Fetch contents on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchContents();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    contents,
    loading,
    error,
    refresh: fetchContents,
    addContent,
    deleteContent,
  };
}