import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, currentInventory } = body;

        if (!image) {
            return NextResponse.json({ error: "Lütfen bir fotoğraf yükleyin." }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        let mimeType = "image/jpeg";
        let cleanBase64 = image;

        if (image.includes("base64,")) {
            const parts = image.split(';base64,');
            if (parts.length === 2) {
                mimeType = parts[0].replace('data:', '');
                cleanBase64 = parts[1];
            }
        }

        const prompt = `
            Sen Tini Jewelry'nin profesyonel "AI Stilist" asistanısın. 
            Kullanıcının yüklediği fotoğrafı (kıyafet, makyaj, ortam vb.) analiz et ve stiline en uygun mücevher kombinini öner.

            ELİNDEKİ ÜRÜNLER (Inventory):
            ${JSON.stringify(currentInventory)}

            Lütfen şu formatta JSON döndür:
            {
                "analysis": "Kullanıcının stil analizi (Elegansı, renk uyumu vb. hakkında nazik ve lüks bir dil)",
                "suggestions": [
                    {
                        "productId": "ID",
                        "reason": "Neden bu ürünü önerdiğine dair stil önerisi",
                        "stylingTip": "Nasıl takması gerektiğine dair ipucu"
                    }
                ],
                "confidence": 0.95
            }

            Not: Sadece inventory'de olan ürünleri öner. Yanıtın sadece saf JSON olsun.
        `;

        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([imagePart, prompt]);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '');

        return NextResponse.json(JSON.parse(responseText));

    } catch (error: any) {
        console.error("AI Stylist Error:", error);
        return NextResponse.json({ error: "Analiz sırasında bir hata oluştu." }, { status: 500 });
    }
}
