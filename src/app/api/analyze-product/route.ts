import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key güvenli bir şekilde backend'de saklanır
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDrm812CGcQwvBVa7YmAAYtrYYPiTov00I";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, customPrompt } = body;

        if (!image) {
            return NextResponse.json({ error: "Resim verisi eksik." }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Base64 formatı: "data:image/png;base64,..." şeklinde gelir (frontend'den)
        // Mime type ve datayı ayıralım
        let mimeType = "image/jpeg"; // Varsayılan
        let cleanBase64 = image;

        if (image.includes("base64,")) {
            const parts = image.split(';base64,');
            if (parts.length === 2) {
                mimeType = parts[0].replace('data:', '');
                cleanBase64 = parts[1];
            }
        }

        let prompt = `
            Sen uzman bir mücevher eksperi ve SEO uyumlu içerik yazarısın. 
            Bu takı resmini detaylıca analiz et ve e-ticaret sitesi için gerekli tüm bilgileri oluştur.

            Lütfen aşağıdaki formatta SAF JSON verisi döndür (Markdown kullanma, json tagleri ekleme):
            {
                "urun_adi": "Ürün Adı (Çekici, lüks, anahtar kelime içeren, 3-6 kelime)",
                "fiyat": "0.00",
                "sku": "URUN-001 (Rastgele bir kod üret)",
                "aciklama": "Ürün Açıklaması (Müşteriyi etkileyen, teknik detayları (taş, zincir vb.) içeren 2-3 paragraflık harika bir metin)",
                "renk": "Sarı",
                "materyal": "gold",
                "kategori": "Kolye",
                "tarz": "Modern",
                "showcaseText": [
                    { "title": "Özellik 1 Başlığı", "description": "Özellik 1 açıklaması" },
                    { "title": "Özellik 2 Başlığı", "description": "Özellik 2 açıklaması" }
                ]
            }

            Notlar:
            - Renk seçenekleri: "Sarı", "Beyaz", "Pembe", "Siyah", "Kırmızı", "Karışık" (En uygununu seç)
            - Materyal seçenekleri: "gold" (Altın), "silver" (Gümüş), "rose_gold" (Rose Gold), "white gold" (Beyaz Altın), "platinum" (Platin)
            - Kategori seçenekleri: "Kolye", "Küpe", "Yüzük", "Bileklik"
            - Tarz seçenekleri: "Modern", "Klasik", "Vintage", "Minimalist", "Gösterişli"
        `;

        // Kullanıcıdan gelen ekstra talimat varsa ekle
        if (customPrompt && customPrompt.trim() !== "") {
            prompt += `\n\nÖNEMLİ EK TALİMATLAR (Buna öncelik ver): ${customPrompt}`;
        }

        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: mimeType
            },
        };

        // Dökümantasyona göre önce resim sonra prompt gönderilmesi önerilir (Multimodal)
        const result = await model.generateContent([imagePart, prompt]);
        const response = await result.response;
        let text = response.text();

        // Temizlik: Bazen AI markdown block içinde döndürür
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonResponse = JSON.parse(text);
        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json({
            error: "AI işlemi başarısız oldu.",
            details: error.message
        }, { status: 500 });
    }
}
