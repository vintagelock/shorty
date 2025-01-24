import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';
import { URL } from 'url';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

interface URLRecord {
    originalUrl: string;
    shortenedId: string;
    createdAt: Date;
    expirationDate?: Date;
    clickCount: number;
    analytics: { 
        ip: any; 
        timestamp: Date;
        useragent: string;
    }[];
}

const urlDatabase: Map<string, URLRecord> = new Map();

// Helper to validate URLs
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Create a shortened URL
app.post('/shorten', async (req: Request, res: Response) : Promise<any> => {
    const { originalUrl, expirationDate } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({ error: 'Invalid or missing originalUrl.' });
    }

    const shortenedId = uuidv4().slice(0, 8); // Generate an 8-character unique ID
    const createdAt = new Date();
    const expDate = expirationDate ? new Date(expirationDate) : undefined;

    if (expDate && expDate <= createdAt) {
        return res.status(400).json({ error: 'Expiration date must be in the future.' });
    }

    const record: URLRecord = {
        originalUrl,
        shortenedId,
        createdAt,
        expirationDate: expDate,
        clickCount: 0,
        analytics: [],
    };

    urlDatabase.set(shortenedId, record);

    res.json({ shortenedUrl: `http://localhost:${port}/${shortenedId}` });
});

// Redirect to original URL and log analytics
app.get('/:shortenedId', async (req: Request, res: Response) : Promise<any> => {
    const { shortenedId } = req.params;
    const record = urlDatabase.get(shortenedId);

    if (!record) {
        return res.status(404).json({ error: 'Shortened URL not found.' });
    }

    if (record.expirationDate && new Date() > record.expirationDate) {
        urlDatabase.delete(shortenedId);
        return res.status(410).json({ error: 'Shortened URL has expired.' });
    }

    record.clickCount += 1;
    record.analytics.push({ ip: req.ip, timestamp: new Date(), useragent: String( req.headers['user-agent'] ) });

    res.redirect(record.originalUrl);
});

// Get analytics for a shortened URL
app.get('/analytics/:shortenedId', async (req: Request, res: Response) : Promise<any> => {
    const { shortenedId } = req.params;
    const record = urlDatabase.get(shortenedId);

    if (!record) {
        return res.status(404).json({ error: 'Shortened URL not found.' });
    }

    res.json({
        originalUrl: record.originalUrl,
        shortenedId: record.shortenedId,
        createdAt: record.createdAt,
        expirationDate: record.expirationDate,
        clickCount: record.clickCount,
        analytics: record.analytics,
    });
});

app.listen(port, () => {
    console.log(`URL Shortener app listening at http://localhost:${port}`);
});

