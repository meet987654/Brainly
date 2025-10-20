import { CrossIcon } from "../../icons/CrossIcon";
import { Input } from "./Input";
import { Button } from "./Button";
import { useRef, useState } from "react";
import { useContent } from "../../hooks/addContent";
import axios from 'axios';

const ContentType = {
  Youtube: "youtube",
  Twitter: "twitter",
  Image: "image",
  Document: "document",
  Text: "text",
} as const;

type ContentType = (typeof ContentType)[keyof typeof ContentType];

//@ts-ignore
export function ContentModal({ open, onClose }) {
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const filenameRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [type, setType] = useState<ContentType>(ContentType.Youtube);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFile, setHasFile] = useState(false);
    const [hasLink, setHasLink] = useState(false);

    const { addContent } = useContent();

    const handleSubmit = async () => {
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;
        let body = bodyRef.current?.value;
        const filename = filenameRef.current?.value;

        if (!title) {
            setError("Please fill in a title");
            return;
        }

        const hasFile = !!(fileRef.current && fileRef.current.files && fileRef.current.files.length);
        if (type === ContentType.Text) {
            if (!body && !link && !hasFile) { setError('Please provide body text, a link, or upload a text file'); return; }
        } else if (type === ContentType.Image) {
            if (!link && !hasFile) { setError('Please provide an image URL or upload an image'); return; }
        } else if (type === ContentType.Document) {
            if (!link && !body && !hasFile) { setError('Please provide document text, a link, or upload a document'); return; }
        } else {
            if (!link) { setError('A link is required for YouTube and Twitter content'); return; }
        }

        try {
            setIsSubmitting(true);
            setError(null);

            let uploadResult: { url?: string; filename?: string; mime?: string } | null = null;

            const file = fileRef.current?.files?.[0];
            if (file) {
                if (type === ContentType.Text && (file.type.startsWith('text/') || file.name.endsWith('.txt'))) {
                    const text = await file.text();
                    body = text;
                } else {
                    const token = localStorage.getItem('token');
                    const fd = new FormData();
                    fd.append('file', file);
                    const resp = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/v1/upload`, fd, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    uploadResult = resp.data;
                }
            }

            const payload: any = {
                title,
                link: uploadResult?.url || (link || ''),
                type,
                filename: uploadResult?.filename || (filename || undefined),
                mime: uploadResult?.mime || undefined,
            };

            if (type === ContentType.Text) {
                payload.body = body || undefined;
            }

            if (type === ContentType.Document && body) {
                payload.body = body;
            }

            await addContent(payload);

            if (titleRef.current) titleRef.current.value = "";
            if (linkRef.current) linkRef.current.value = "";
            if (bodyRef.current) bodyRef.current.value = "";
            if (filenameRef.current) filenameRef.current.value = "";
            if (fileRef.current) fileRef.current.value = "";
            setType(ContentType.Youtube);
            setHasFile(false);
            setHasLink(false);

            onClose();
        } catch (err) {
            console.error("Error adding content:", err);
            setError("Failed to add content. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setHasFile(false);
        setHasLink(false);
        onClose();
    };

    return (
        <div>
            {open && (
                <div className="w-screen h-screen bg-slate-950/60 fixed top-0 left-0 flex justify-center items-center backdrop-blur-md z-50 p-4">
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl p-6 md:p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white">Add New Content</h2>
                            <button 
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-800/50 cursor-pointer rounded-full transition-all duration-200 text-gray-400 hover:text-white"
                                disabled={isSubmitting}
                            >
                                <CrossIcon size="medium" />
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 md:mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <div className="space-y-4 md:space-y-5 mb-5 md:mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title
                                </label>
                                <Input 
                                    ref={titleRef}
                                    placeholder="Enter title..." 
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            {/* Show link field only for Youtube, Twitter, and Image */}
                            {(type === ContentType.Youtube || type === ContentType.Twitter || type === ContentType.Image) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {type === ContentType.Image ? 'Image URL' : 'Link'}
                                    </label>
                                    <Input 
                                        ref={linkRef}
                                        placeholder={type === ContentType.Image ? "https://example.com/image.jpg" : "https://example.com"}
                                        disabled={isSubmitting || (type === ContentType.Image && hasFile)}
                                        onChange={(e) => setHasLink(!!e.target.value)}
                                    />
                                    {type === ContentType.Image && hasFile && (
                                        <p className="text-xs text-red-400 mt-2">⚠️ Remove uploaded file to use URL</p>
                                    )}
                                </div>
                            )}

                            {/* OR divider for images */}
                            {type === ContentType.Image && (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 border-t border-slate-700"></div>
                                    <span className="text-sm font-medium text-gray-400">OR</span>
                                    <div className="flex-1 border-t border-slate-700"></div>
                                </div>
                            )}

                            {/* Show file upload for Image and Document only */}
                            {(type === ContentType.Image || type === ContentType.Document) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {type === ContentType.Image ? 'Upload Image' : 'Upload File'}
                                    </label>
                                    <input 
                                        ref={fileRef} 
                                        type="file" 
                                        className={`w-full text-sm text-gray-300 file:mr-2 md:file:mr-4 file:py-2 file:px-3 md:file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 file:cursor-pointer border rounded-xl p-2 md:p-3 transition-all duration-200 ${(type === ContentType.Image && hasLink) ? 'border-slate-700 bg-slate-800/30 opacity-50' : 'border-purple-500/30 bg-slate-800/50 hover:border-purple-500/50'}`}
                                        disabled={isSubmitting || (type === ContentType.Image && hasLink)}
                                        onChange={(e) => setHasFile(!!e.target.files?.length)}
                                        accept={type === ContentType.Image ? "image/*" : "*"}
                                    />
                                    {type === ContentType.Image && hasLink && (
                                        <p className="text-xs text-red-400 mt-2">⚠️ Clear URL above to upload file</p>
                                    )}
                                </div>
                            )}

                            {type === ContentType.Text && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                                    <textarea 
                                        ref={bodyRef} 
                                        className="w-full p-3 bg-slate-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 focus:bg-slate-800/60 outline-none transition-all duration-300 backdrop-blur-sm hover:border-purple-500/50 resize-none" 
                                        rows={4} 
                                        placeholder="Write your content here..." 
                                        disabled={isSubmitting} 
                                    />
                                </div>
                            )}

                            {/* Filename field for Image and Document only */}
                            {(type === ContentType.Image || type === ContentType.Document) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Filename
                                    </label>
                                    <Input 
                                        ref={filenameRef}
                                        placeholder="my-file.pdf" 
                                        disabled={isSubmitting}
                                    />
                                </div>
                            )}

                            {/* Content Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Content Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button text="Youtube" size="medium" variant={type === ContentType.Youtube ? "primary" : "secondary"} onClick={() => setType(ContentType.Youtube)} disabled={isSubmitting} />
                                    <Button text="Twitter" size="medium" variant={type === ContentType.Twitter ? "primary" : "secondary"} onClick={() => setType(ContentType.Twitter)} disabled={isSubmitting} />
                                    <Button text="Image" size="medium" variant={type === ContentType.Image ? "primary" : "secondary"} onClick={() => setType(ContentType.Image)} disabled={isSubmitting} />
                                    <Button text="Document" size="medium" variant={type === ContentType.Document ? "primary" : "secondary"} onClick={() => setType(ContentType.Document)} disabled={isSubmitting} />
                                    <Button text="Text" size="medium" variant={type === ContentType.Text ? "primary" : "secondary"} onClick={() => setType(ContentType.Text)} disabled={isSubmitting} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-700/50">
                            <div className="w-full sm:w-auto">
                                <Button 
                                    variant="secondary" 
                                    size="medium" 
                                    text="Cancel" 
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    fullWidth={true}
                                />
                            </div>
                            <div className="w-full sm:w-auto">
                                <Button 
                                    variant="primary" 
                                    size="medium" 
                                    text={isSubmitting ? "Adding..." : "Submit"}
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    fullWidth={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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