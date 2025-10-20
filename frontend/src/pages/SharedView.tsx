import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface Content {
  _id: string;
  title: string;
  link: string;
  type: string;
  userId?: {
    username: string;
  };
}

export default function SharedView() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${BACKEND_URL}/api/v1/brain/${hash}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('This shared brain link was not found or has been removed');
          }
          throw new Error('Failed to load shared content');
        }
        
        const data = await res.json();
        setContents(data.contents || []);
        
        // Extract owner username
        if (data.contents && data.contents.length > 0 && data.contents[0].userId) {
          setOwner(data.contents[0].userId.username);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load shared content');
      } finally {
        setLoading(false);
      }
    }
    
    if (hash) {
      load();
    }
  }, [hash]);

  

  // Normalize arbitrary content.type values to the Card component's expected union
  const mapTypeForCard = (t?: string) => {
    if (!t) return 'youtube' as const;
    const lower = t.toLowerCase();
    if (lower.includes('twitter') || lower.includes('x')) return 'twitter' as const;
    if (lower.includes('youtube') || lower.includes('youtu') || lower.includes('video')) return 'youtube' as const;
    // default to youtube for unknown types so the Card shows a thumbnail/embed when possible
    return 'youtube' as const;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading shared brain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Brain Not Found</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      {/* Animated background */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(800px circle at 50% 50%, rgba(139, 92, 246, 0.1), transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {owner ? `${owner}'s Brain` : 'Shared Brain'}
                </h1>
                <p className="text-gray-400 text-sm">Public view • Read-only</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700/50 transition-colors border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        {contents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Content Yet</h2>
            <p className="text-gray-400">This brain is empty. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Shared Content
              </h2>
              <p className="text-gray-400">{contents.length} items shared</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Card
                  key={content._id}
                  id={content._id}
                  title={content.title}
                  link={content.link}
                  type={mapTypeForCard(content.type)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-lg mt-20">
        <div className="max-w-6xl mx-auto px-8 py-6 text-center">
          <p className="text-gray-400 text-sm">
            Want to create your own second brain?{' '}
            <button
              onClick={() => navigate('/auth')}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}