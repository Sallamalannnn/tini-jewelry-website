import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDrm812CGcQwvBVa7YmAAYtrYYPiTov00I";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, customPrompt } = body;

        // Imagen modelleri genellikle prompt ile çalışır. 
        // Ancak "Resmi dönüştür" isteği için önce mevcut resmi analiz edip,
        // onu tarif eden güçlü bir prompt oluşturup, sonra yeni resim üretebiliriz (veya varsa img2img desteği).
        // Şimdilik Imagen 3/4 modellerini Text-to-Image olarak denerken, referans olarak önceki resmi kullanmaya çalışacağız
        // veya sadece prompt üzerinden gideceğiz.

        // Listeden seçtiğimiz model: imagen-4.0-fast-generate-001 (veya 3.0)
        // Not: SDK üzerinden doğrudan resim çıktısı almak farklı olabilir.
        // Genellikle generateContent yerine farklı bir method gerekebilir ama
        // Google GenAI SDK'sı bazen bunu encapsulate eder.

        // Güvenli tarafta kalmak için şimdilik 'gemini-2.5-flash' ile "Resmi Görselleştirme Promptu" hazırlatıp
        // Sonra (Eğer SDK destekliyorsa) resim ürettireceğiz.
        // FAKAT şimdilik, kullanıcının "Code same setup" isteğine uyarak
        // Doğrudan bir generation endpoint simülasyonu yapacağım.

        // NOT: Google GenAI Node SDK'sı şu an için 'imagen' modellerini generateContent altında
        // her zaman desteklemeyebiliyor (REST API gerekebilir).
        // Ancak denemek için en iyi model ID'sini kullanacağız.

        // HATA ÖNLEME: Şu anki SDK sürümünde doğrudan resim byte'ı dönen method farklı olabilir.
        // Biz burada standart flow'u kuracağız.

        // 1. Adım: Mevcut resmi analiz et ve görselleştirme promptu oluştur
        let mimeType = "image/jpeg";
        let cleanBase64 = image;
        if (image && image.includes("base64,")) {
            const parts = image.split(';base64,');
            if (parts.length === 2) {
                mimeType = parts[0].replace('data:', '');
                cleanBase64 = parts[1];
            }
        }

        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: mimeType
            },
        };

        const analysisPrompt = `
            Bu ürün görselini incele. Bu ürünü e-ticaret sitesinde vitrin görseli olarak kullanmak için
            ultra-gerçekçi, profesyonel stüdyo ışıklandırmalı, 4k kalitesinde, 
            ${customPrompt ? `"${customPrompt}" temalı` : "modern ve lüks bir atmosferde"}
            gösteren bir fotoğraf oluşturmak için detaylı bir İngilizce prompt yaz.
            Sadece İngilizce promptu döndür.
        `;

        let imageGenPrompt = "";

        try {
            // Önce öncelikli model ile dene
            const analyzerModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await analyzerModel.generateContent([imagePart, analysisPrompt]);
            imageGenPrompt = result.response.text();
        } catch (primaryError) {
            console.warn("Gemini 3 Pro kotası dolu/erişilemedi, 2.5 Flash'a geçiliyor:", primaryError);
            // Fallback
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await fallbackModel.generateContent([imagePart, analysisPrompt]);
            imageGenPrompt = result.response.text();
        }

        // 2. GÖRSEL ÜRETİM AŞAMASI: Gemini 2.0 Flash Image Gen (Ücretsiz Alternatif)
        // Imagen ücretli olduğu için, listede görünen deneysel (experimental) image-generation modelini deniyoruz.
        let generatedImageBase64 = null;
        let generationMsg = "Görselifikasyon Promptu Hazırlandı (Resim Üretilemedi)";

        try {
            // Not: Gemini görsel üretim modelleri genellikle 'generateContent' ile çalışır ve inlineData döndürür.
            // Ancak garanti olsun diye önce REST API deniyoruz.
            const targetImageModel = "gemini-2.0-flash-exp-image-generation";

            // Bu modelin kullanım şekli standart Gemini'den farklı olabilir, 
            // ama genellikle 'predict' veya 'generateContent' ile çalışır.
            // Biz standart SDK yolunu bu model için deneyelim, çünkü bu bir 'Gemini' modeli.

            const imageModel = genAI.getGenerativeModel({ model: targetImageModel });
            const imgResult = await imageModel.generateContent(imageGenPrompt);
            const imgResponse = await imgResult.response;

            if (imgResponse.candidates && imgResponse.candidates[0].content.parts[0].inlineData) {
                const imgData = imgResponse.candidates[0].content.parts[0].inlineData;
                generatedImageBase64 = `data:${imgData.mimeType};base64,${imgData.data}`;
                generationMsg = "Görsel (Gemini 2.0 Exp) Başarıyla Oluşturuldu";
            } else {
                throw new Error("API yanıtında görsel verisi (inlineData) bulunamadı.");
            }

        } catch (imgErr: any) {
            console.warn("Gemini Image Gen Failed:", imgErr.message);
            // Hata yönetimi
            generationMsg = `Prompt hazırlandı. Resim üretimi (Gemini 2.0 Exp) başarısız: ${imgErr.message}`;
        }

        return NextResponse.json({
            success: true,
            message: generationMsg,
            generatedPrompt: imageGenPrompt,
            image: generatedImageBase64
        });

    } catch (error: any) {
        console.error("Image Gen Error:", error);

        // TEŞHİS:
        let availableModels = "Models could not be listed.";
        try {
            const listModelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
            const listModelsData = await listModelsRes.json();
            if (listModelsData.models) {
                availableModels = listModelsData.models.map((m: any) => m.name).join(", ");
            } else if (listModelsData.error) {
                availableModels = `List Error: ${listModelsData.error.message}`;
            }
        } catch (listErr) {
            console.error("List Models Failed:", listErr);
        }

        return NextResponse.json({
            error: "Görsel oluşturma başarısız.",
            details: `Genel Hata: ${error.message}`
        }, { status: 500 });
    }
}

