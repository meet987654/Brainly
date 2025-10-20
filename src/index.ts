import express from 'express';
const app = express();
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import cors from 'cors';
app.use(cors());
import {ContentModel, LinkModel} from './db.js'
dotenv.config();
app.use(express.json());
import { random } from './utils.js';
import { UserModel } from './db.js';
import { authToken } from './middleware.js';

// file upload support
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) => cb(null, UPLOAD_DIR),
    filename: (_req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
        const name = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        cb(null, name);
    }
});

const upload = multer({ storage });

// serve uploaded files publicly
app.use('/uploads', express.static(UPLOAD_DIR));

app.post("/api/v1/signup",async(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    
    // Basic validation
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    
    if (password.length < 6) {
        return res.status(400).json({message: "Password must be at least 6 characters"});
    }
    
    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(409).json({message: "Username already exists"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({username, password: hashedPassword});
        res.status(201).json({message: "User created successfully"});
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({message: "Error creating user", error: error.message});
    }
});

app.post("/api/v1/signin", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        const user = await UserModel.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '7d' }  // Extended token life
        );

        res.json({ token });
        
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/v1/content", authToken, async (req, res) => {
    try {
        const { title, link, tags, type, body, filename, mime } = req.body;
        // @ts-ignore
        const userId = req.userId;
        // Basic validation depending on type
        if (!title) return res.status(400).json({ message: "Title is required" });

        // Flexible validation: text must have body OR link; document can be link or uploaded/file url; image can be link or uploaded file
        if (type === 'text') {
            if (!body && !link) return res.status(400).json({ message: 'Body text or a link is required for text content' });
        } else if (type === 'image') {
            if (!link && !filename) return res.status(400).json({ message: 'Link (URL) or uploaded file is required for image content' });
        } else if (type === 'document') {
            if (!link && !body && !filename) return res.status(400).json({ message: 'Provide a link, file upload, or body text for document' });
        } else {
            // youtube/twitter and other link-based types
                if (!link) return res.status(400).json({ message: 'A link is required for YouTube and Twitter content' });
        }

                const created = await ContentModel.create({ title, link, tags, type, body, filename, mime, userId });
        const content = await created.populate('userId', 'username');
        res.status(201).json({ message: "Content created successfully", content });
    } catch (error: any) {
        console.error('Create content error:', error);
        res.status(500).json({ message: "Error creating content", error: error.message });
    }
});

// Upload endpoint: accepts single file and returns public URL and metadata
app.post('/api/v1/upload', authToken, upload.single('file'), async (req, res) => {
    try {
        // @ts-ignore
        const userId = (req as any).userId;
        const uploaded = (req as any).file;
        if (!uploaded) return res.status(400).json({ message: 'No file uploaded' });

        const protocol = req.protocol;
        const host = req.get('host');
        const publicUrl = `${protocol}://${host}/uploads/${uploaded.filename}`;
        return res.status(201).json({ message: 'File uploaded', url: publicUrl, filename: uploaded.originalname, mime: uploaded.mimetype });
    } catch (err: any) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

app.get("/api/v1/content", authToken, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const contents = await ContentModel.find({ userId }).populate("userId", "username");
        res.status(200).json({ message: "Contents fetched successfully", contents });
    } catch (error: any) {
        console.error('Fetch contents error:', error);
        res.status(500).json({ message: "Error fetching contents", error: error.message });
    }
});

app.delete("/api/v1/content/:id", authToken, async (req, res) => {
    try {
        const contentId = req.params.id;
        // @ts-ignore
        const userId = req.userId;

        const deleted = await ContentModel.findOneAndDelete({ _id: contentId, userId });
        if (!deleted) {
            return res.status(404).json({ message: "Content not found or not owned by user" });
        }
        res.status(200).json({ message: "Content deleted successfully" });
    } catch (error: any) {
        console.error('Delete content error:', error);
        res.status(500).json({ message: "Error deleting content", error: error.message });
    }
});

// Get current user's share link status
app.get('/api/v1/brain/share', authToken, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const link = await LinkModel.findOne({ userId });
        
        if (!link) {
            return res.json({ share: false });
        }
        
        res.json({ 
            share: true, 
            hash: link.hash,
            shareLink: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${link.hash}`
        });
    } catch (error: any) {
        console.error('Get share link error:', error);
        res.status(500).json({ message: 'Error fetching share link', error: error.message });
    }
});

// Create or remove share link
app.post("/api/v1/brain/share", authToken, async (req, res) => {
    try {
        const share = req.body.share;
        // @ts-ignore
        const userId = req.userId;
        
        if (share) {
            // Create or return existing share link
            const existingLink = await LinkModel.findOne({ userId });

            if (existingLink) {
                return res.status(200).json({
                    message: "Share link already exists",
                    hash: existingLink.hash,
                    shareLink: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${existingLink.hash}`
                });
            }
            
            const hash = random(10);
            await LinkModel.create({ userId, hash });

            res.json({
                message: "Share link created successfully",
                hash,
                shareLink: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${hash}`
            });
        } else {
            // Remove share link
            await LinkModel.deleteOne({ userId });
            res.json({
                message: "Share link removed successfully",
            });
        }
    } catch (error: any) {
        console.error('Share toggle error:', error);
        res.status(500).json({ message: "Error toggling share", error: error.message });
    }
});

// PUBLIC endpoint: Get shared brain contents (NO authentication required)
app.get("/api/v1/brain/:sharelink", async (req, res) => {
    try {
        const hash = req.params.sharelink;
        
        const link = await LinkModel.findOne({ hash });

        if (!link) {
            return res.status(404).json({ message: "Share link not found or expired" });
        }

        const contents = await ContentModel.find({
            userId: link.userId
        }).populate("userId", "username");

        res.json({
            message: "Contents fetched successfully",
            contents,
            owner: contents[0]?.userId || null
        });
    } catch (error: any) {
        console.error('Get shared brain error:', error);
        res.status(500).json({ message: "Error fetching shared contents", error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});