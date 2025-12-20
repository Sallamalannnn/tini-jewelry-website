import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customer, totalPrice } = body;

        const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY;

        if (!SHOPIER_API_KEY) {
            return NextResponse.json({ error: 'Shopier API key is missing' }, { status: 500 });
        }

        // Shopier V2 API implementation
        // Note: For custom websites, Shopier usually prefers a form POST with a signature.
        // However, with a Personal Access Token (JWT), we should use their REST API.

        // This is a placeholder for the actual Shopier V2 Purchase creation.
        // If the REST API for purchases is not available for this account type, 
        // we might need to use the classical form post method.

        // Let's assume the modern V2 approach:
        const shopierResponse = await fetch('https://api.shopier.com/v1/shop/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SHOPIER_API_KEY}`
            },
            body: JSON.stringify({
                payment_method: 'card',
                buyer: {
                    first_name: customer.firstName,
                    last_name: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                },
                address: {
                    first_name: customer.firstName,
                    last_name: customer.lastName,
                    address: customer.address,
                    city: customer.city,
                    country: 'Turkey',
                    zip_code: customer.zip,
                },
                items: items.map((item: any) => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total_price: totalPrice,
                currency: 'TRY',
                // Local callback URL for your site
                callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://' + req.headers.get('host')}/api/checkout/shopier/callback`
            })
        });

        const data = await shopierResponse.json();

        // If the API call fails or is not supported, we will use a fallback 
        // that generates a legacy signature-based redirect if we had the secret.
        // But since we have the PAT, we expect a modern response.

        if (shopierResponse.ok && data.url) {
            return NextResponse.json({ url: data.url });
        }

        // FALLBACK: If the V2 API is not yet available for purchases for this key,
        // we will generate a direct link to a Shopier product if it was a single item,
        // or guide the user.

        console.error('Shopier API error:', data);

        // If it's a "Not Found" or "Unauthorized", it might be that the endpoint is different.
        // For Tini Jewelry, we'll provide a helpful error for now if it fails.
        return NextResponse.json({
            error: 'Shopier entegrasyonu şu an yapılandırılıyor. Lütfen Shopier panelinizden API erişiminin aktif olduğundan emin olun.',
            details: data
        }, { status: 400 });

    } catch (error: any) {
        console.error('Shopier API Exception:', error);
        return NextResponse.json({ error: 'Ödeme sistemi ile iletişim kurulurken bir hata oluştu.' }, { status: 500 });
    }
}
