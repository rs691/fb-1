import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Product } from '@/lib/types';

// Ensure the Stripe secret key is available
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: { product: Product; quantity: number }[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: [item.product.imageUrl],
          description: item.product.description,
        },
        unit_amount: item.product.price * 100, // Price in cents
      },
      quantity: item.quantity,
    }));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cart`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
