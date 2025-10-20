import { TwitterIcon } from "../../icons/TwitterIcon";
import { SideBarItem } from "./SideBarItem";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { FileText, Image, Menu, X, Brain } from 'lucide-react';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

interface SideBarProps {
    isOpen: boolean;
    onToggle: () => void;
    selectedType?: string | null;
    onSelectType?: (type: string | null) => void;
}

export function SideBar({ isOpen, onToggle, selectedType = null, onSelectType }: SideBarProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const goToDashboard = () => {
        if (location.pathname === '/dashboard') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (isOpen && onToggle) onToggle();
            return;
        }
        navigate('/dashboard');
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (isOpen && onToggle) onToggle();
        }, 220);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isHovering) {
                setMousePosition({ x: e.clientX, y: e.clientY });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [isHovering]);

    return (
        <div 
            className={`h-full fixed bg-slate-950/95 backdrop-blur-xl border-r border-purple-500/20 shadow-2xl transition-all duration-500 ease-out z-50 ${isOpen ? 'w-76' : 'w-20'}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                boxShadow: '4px 0 24px rgba(168, 85, 247, 0.15)',
            }}
        >
            {/* Animated glow overlay */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500"
                style={{
                    background: isHovering 
                        ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.15), transparent 40%)`
                        : 'transparent',
                }}
            />

            {/* Content wrapper */}
            <div className={`relative z-10 h-full flex flex-col ${isOpen ? 'px-6' : 'px-4'}`}>
                {/* Header with Logo and Toggle */}
                <div className="flex items-center justify-between pt-8 pb-8">
                    <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center w-full'}`}>
                        {/* Modern Logo (click to go to dashboard) */}
                        <div className="relative group cursor-pointer" onClick={goToDashboard}>
                            <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-md group-hover:bg-purple-500/30 transition-all duration-300"></div>
                            <div className="relative p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                                <Brain className="text-white" size={isOpen ? 32 : 28} strokeWidth={2} />
                            </div>
                        </div>
                        
                        {isOpen && (
                            <div 
                                className="text-white font-bold text-2xl tracking-tight transition-all duration-300 cursor-pointer"
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    textShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                                }}
                                onClick={goToDashboard}
                            >
                                Brainly
                            </div>
                        )}
                    </div>
                    
                    {/* Toggle Button */}
                    {isOpen && (
                        <button
                            onClick={onToggle}
                            className="text-purple-400 hover:text-white transition-all duration-300 p-2 hover:bg-purple-500/20 rounded-lg group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                {/* Open Sidebar Button (when closed) */}
                {!isOpen && (
                    <button
                        onClick={onToggle}
                        className="w-full flex justify-center text-purple-400 hover:text-white transition-all duration-300 p-3 hover:bg-purple-500/20 rounded-xl mb-6 group"
                    >
                        <Menu size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    </button>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6"></div>

                {/* Sidebar Items */}
                {isOpen && (
                    <div className="space-y-3 flex-1">
                        <div className="mb-4">
                            <p className="text-purple-300/60 text-xs font-semibold uppercase tracking-wider mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Content Sources
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <SideBarItem 
                                text="Twitter" 
                                icon={<div className="text-cyan-400"><TwitterIcon size="large" /></div>}
                                active={selectedType === 'twitter'}
                                onClick={() => onSelectType && onSelectType(selectedType === 'twitter' ? null : 'twitter')}
                            />
                            <SideBarItem 
                                text="Youtube" 
                                icon={<div className="text-red-400"><YoutubeIcon size="xlarge"/></div>}
                                active={selectedType === 'youtube'}
                                onClick={() => onSelectType && onSelectType(selectedType === 'youtube' ? null : 'youtube')}
                            />
                            <SideBarItem
                                text="Image"
                                icon={<div className="text-blue-400"><Image size={20} /></div>}
                                active={selectedType === 'image'}
                                onClick={() => onSelectType && onSelectType(selectedType === 'image' ? null : 'image')}
                            />
                            <SideBarItem
                                text="Document"
                                icon={<div className="text-purple-300"><FileText size={20} /></div>}
                                active={selectedType === 'document'}
                                onClick={() => onSelectType && onSelectType(selectedType === 'document' ? null : 'document')}
                            />
                            <SideBarItem
                                text="Text"
                                icon={<div className="text-slate-300">T</div>}
                                active={selectedType === 'text'}
                                onClick={() => onSelectType && onSelectType(selectedType === 'text' ? null : 'text')}
                            />
                        </div>
                    </div>
                )}

                {/* Icon-only view when closed */}
                {!isOpen && (
                    <div className="space-y-4 flex-1 flex flex-col items-center">
                        <div className="text-cyan-400 p-3 hover:bg-purple-500/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20 group" onClick={() => onSelectType && onSelectType(selectedType === 'twitter' ? null : 'twitter')}>
                            <TwitterIcon size="large" />
                        </div>
                        <div className="text-red-400 p-3 hover:bg-purple-500/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20 group" onClick={() => onSelectType && onSelectType(selectedType === 'youtube' ? null : 'youtube')}>
                            <YoutubeIcon size="xlarge"/>
                        </div>
                        <div className="text-blue-400 p-3 hover:bg-purple-500/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 group" onClick={() => onSelectType && onSelectType(selectedType === 'image' ? null : 'image')}>
                            <Image size={20} />
                        </div>
                        <div className="text-purple-300 p-3 hover:bg-purple-500/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20 group" onClick={() => onSelectType && onSelectType(selectedType === 'document' ? null : 'document')}>
                            <FileText size={20} />
                        </div>
                        <div className="text-slate-300 p-3 hover:bg-purple-500/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-500/20 group" onClick={() => onSelectType && onSelectType(selectedType === 'text' ? null : 'text')}>
                            <div className="text-sm font-medium">T</div>
                        </div>
                    </div>
                )}

                {/* Bottom decoration */}
                <div className="pb-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-4"></div>
                    {isOpen ? (
                        <div className="text-center">
                            <p className="text-purple-400/60 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Your Second Brain
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}