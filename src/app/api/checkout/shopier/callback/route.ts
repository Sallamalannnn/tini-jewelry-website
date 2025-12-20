import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Shopier sends payment notification as a POST request (form-data or JSON)
        // We need to verify this signature if security is a priority.
        // For now, we'll log the result.

        const data = await req.formData();
        const status = data.get('res_status'); // 'success' or 'fail'
        const orderId = data.get('order_id');

        if (status === 'success') {
            // Update order status in your database
            return NextResponse.redirect(new URL('/checkout/success', req.url));
        } else {
            return NextResponse.redirect(new URL('/checkout/error', req.url));
        }
    } catch (error) {
        return NextResponse.json({ error: 'Callback handling failed' }, { status: 500 });
    }
}
