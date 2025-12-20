import { NextResponse } from 'next/server';
import { updateOrderShippingCode } from '@/lib/orderStore';

// This endpoint simulates receiving a shipping update from Shopier or a Cargo Integration
// In a real scenario, you would configure this URL in your Shopier/Cargo integration settings.

export async function POST(req: Request) {
    try {
        // Parse the incoming data. 
        // Shopier often sends form-data, but generic webhooks might use JSON.
        // We'll support JSON for this implementation as it's cleaner for modern integrations.
        const body = await req.json();

        // Expecting keys like: { orderId: '...', trackingNumber: '...' }
        const { orderId, trackingNumber, status } = body;

        console.log('Received Shipping Webhook:', body);

        if (!orderId || !trackingNumber) {
            return NextResponse.json({ error: 'Missing orderId or trackingNumber' }, { status: 400 });
        }

        // Update the database
        const success = await updateOrderShippingCode(orderId, trackingNumber);

        if (success) {
            return NextResponse.json({ message: 'Order updated successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
