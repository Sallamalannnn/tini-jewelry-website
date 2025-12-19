import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use a vision-capable model

interface GeneratedProductContent {
    name: string;
    description: string;
    showcaseText: { title: string; description: string }[];
    detectedAttributes?: {
        color: string;
        material: string;
        category: string;
    };
}

export const generateProductContent = async (
    category: string,
    baseName: string,
    material: string = "Gümüş",
    style: string = "Modern",
    imageBase64?: string
): Promise<GeneratedProductContent> => {
    try {
        let requestPrompt = "";
        let requestParts: any[] = [];

        // Common JSON Schema Instruction
        const jsonInstruction = `
            Lütfen aşağıdaki formatta JSON çıktısı ver (Markdown yok, sadece saf JSON string):
            {
                "name": "Ürün Adı (3-6 kelime, pazarlama odaklı, örn: 'Sonsuzluk Işıltısı: Pırlanta Baget Yüzük')",
                "description": "Ürün Açıklaması (2-3 paragraf, SEO uyumlu, duygusal ve teknik detayları içeren akıcı bir metin)",
                "showcaseText": [
                    { "title": "Özellik 1", "description": "Detaylı açıklama" },
                    { "title": "Özellik 2", "description": "Detaylı açıklama" }
                ],
                "detectedAttributes": {
                     "color": "Renk (Sarı, Beyaz, Pembe, Siyah, Karışık)",
                     "material": "Materyal Tipi (gold, silver, rose_gold, white gold, platinum)",
                     "category": "Kategori (Kolye, Küpe, Yüzük, Bileklik)",
                     "style": "Tarz (Modern, Klasik, Minimalist, Vintage, Gösterişli)"
                }
            }
        `;

        let result;

        if (imageBase64) {
            // VISION MODE: Analyze the image
            const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

            const imagePart = {
                inlineData: {
                    data: cleanBase64,
                    mimeType: "image/jpeg"
                },
            };

            requestPrompt = `
                Sen uzman bir mücevher eksperi ve metin yazarısın. Ekli resimdeki takıyı görsel olarak analiz et.
                
                Lütfen şu adımları izle:
                1. Resimdeki ürünün ne olduğunu tespit et (Kolye, küpe vb.).
                2. Materyalini ve rengini tespit et (Altın mı, gümüş mü, taşlı mı?).
                3. Tarzını ve tasarım detaylarını (motifler, taşlar, zincir tipi) incele.
                4. Bu görsel analizlere dayanarak, ürün için çok şık, lüks hissettiren ve satın alma isteği uyandıran bir isim ve açıklama yaz.
                
                ${jsonInstruction}
            `;

            result = await model.generateContent([requestPrompt, imagePart]);

        } else {
            // TEXT MODE: Use provided parameters
            requestPrompt = `
                Bir takı e-ticaret sitesi için ürün içeriği oluştur.
                Ürün Kategorisi: ${category}
                Temel İsim/İpucu: ${baseName}
                Malzeme: ${material}
                Tarz: ${style}

                ${jsonInstruction}
            `;
            result = await model.generateContent(requestPrompt);
        }

        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const json = JSON.parse(text);

        return json;
    } catch (error) {
        console.error("AI Content Generation Failed:", error);
        // Fallback content in case of error
        return {
            name: baseName,
            description: `${baseName}, özel tasarım ve el işçiliği ile sizin için üretildi. Şıklığı ve zarafeti bir arada sunar.`,
            showcaseText: []
        };
    }
};
