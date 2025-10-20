import jwt from 'jsonwebtoken';

// Middleware accepts either Authorization: Bearer <token> or a token header
export const authToken = (req: any, res: any, next: any) => {
        let token = req.headers.authorization || req.headers.Authorization || req.headers.token || req.headers.Token;

        if (!token) {
                return res.status(401).json({ message: "No token provided" });
        }

        if (typeof token === 'string' && token.startsWith('Bearer ')) {
                token = token.slice(7);
        }

        try {
                const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { userId: string };
                req.userId = decoded.userId;
                next();
        } catch (error) {
                return res.status(401).json({ message: "Invalid token" });
        }
};
