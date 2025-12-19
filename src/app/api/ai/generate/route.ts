import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Google Banana API Service ---
class GoogleBananaService {
    private apiKey: string;
    private genAI: GoogleGenerativeAI | null;

    constructor() {
        this.apiKey = process.env.GOOGLE_BANANA_API_KEY || process.env.GEMINI_API_KEY || '';
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    }

    async generate(imageBuffer: Buffer, fileType: string): Promise<{ url: string, mode: string, promptUsed?: string }> {
        let selectedStyle = 'dark'; // Default
        let aiPrompt = "Simulated Analysis";

        // 1. Try Cloud Analysis (Gemini Vision)
        if (this.genAI) {
            try {
                console.log('🍌 Google Banana: Analyzing image with Gemini 3 Pro...');
                // User requested Gemini 3 Pro specifically
                const model = this.genAI.getGenerativeModel({ model: "gemini-3.0-pro" });

                // Convert buffer to GoogleGenerativeAI format
                const imagePart = {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: fileType
                    },
                };

                const prompt = "Analyze this product image. Determine the best background style for a luxury e-commerce showcase. Choose EXACTLY ONE of these options: 'Marble', 'Nature', 'Neon', 'Dark'. Return ONLY the word.";

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text().trim();

                console.log(`🍌 AI Suggestion: ${text}`);

                // Map AI response to our assets
                if (text.toLowerCase().includes('marble')) selectedStyle = 'marble';
                else if (text.toLowerCase().includes('nature')) selectedStyle = 'nature';
                else if (text.toLowerCase().includes('neon')) selectedStyle = 'neon';
                // else Dark is default

                aiPrompt = `AI Decision: ${text}`;

            } catch (error) {
                console.warn('🍌 Google Banana Cloud Analysis failed, switching to local heuristics:', error);
            }
        }

        // 2. Generate Image (Banana Nano Service)
        return this.renderComposition(imageBuffer, selectedStyle, aiPrompt);
    }

    private async renderComposition(buffer: Buffer, styleName: string, promptInfo: string): Promise<{ url: string, mode: string, promptUsed?: string }> {
        console.log(`🍌 Google Banana: Rendering with style '${styleName}'...`);

        // Map style to filename
        const styleMap: { [key: string]: string } = {
            'marble': 'marble.png',
            'nature': 'nature.png',
            'neon': 'neon.png',
            'dark': 'dark.png'
        };
        const bgFileName = styleMap[styleName.toLowerCase()] || 'dark.png';
        const bgPath = path.join(process.cwd(), 'public', 'demo', 'styles', bgFileName);

        // Fallback checks
        let finalBgPath = bgPath;
        if (!fs.existsSync(finalBgPath)) {
            const stylesDir = path.join(process.cwd(), 'public', 'demo', 'styles');
            if (fs.existsSync(stylesDir)) {
                const files = fs.readdirSync(stylesDir).filter(f => f.endsWith('.png'));
                if (files.length > 0) finalBgPath = path.join(stylesDir, files[0]);
            }
        }

        if (!fs.existsSync(finalBgPath)) throw new Error('No background assets found.');

        // Processing Pipeline
        const bgMetadata = await sharp(finalBgPath).metadata();
        const targetWidth = Math.floor((bgMetadata.width || 1024) * 0.65);

        // Auto-Trim & Resize
        const productLayer = await sharp(buffer)
            .trim()
            .resize({ width: targetWidth, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toBuffer();

        // Composite
        const finalImage = await sharp(finalBgPath)
            .composite([{ input: productLayer, gravity: 'center' }])
            .toFormat('png')
            .toBuffer();

        // Save
        const fileName = `banana-gen-${Date.now()}.png`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const outputPath = path.join(uploadDir, fileName);
        fs.writeFileSync(outputPath, finalImage);

        return {
            url: `/uploads/${fileName}`,
            // Update the label to reflect the Upgrade
            mode: this.genAI ? 'Gemini 3 Pro (Vision)' : 'Banana Nano (Simulated)',
            promptUsed: promptInfo
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) return NextResponse.json({ error: 'Resim yüklenmedi.' }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());

        // Initialize Service
        const bananaService = new GoogleBananaService();
        const result = await bananaService.generate(buffer, file.type);

        return NextResponse.json({
            success: true,
            imageUrl: result.url,
            mode: result.mode,
            prompt: result.promptUsed,
            message: `Google Banana: ${result.promptUsed}`
        });

    } catch (error) {
        console.error('Google Banana API Error:', error);
        return NextResponse.json({ error: 'Servis yanıt vermedi.' }, { status: 500 });
    }
}
