import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    // Validate amount
    if (!amount || amount < 1) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be at least 1 rupee' },
        { status: 400 }
      );
    }

    const amountInPaisa = Math.round(amount * 100);

    // Ensure minimum amount (100 paisa = 1 rupee)
    if (amountInPaisa < 100) {
      console.error('Amount too small:', amountInPaisa);
      return NextResponse.json(
        { error: 'Amount too small. Minimum amount is 1 rupee' },
        { status: 400 }
      );
    }

    const options = {
      amount: amountInPaisa, // Amount in paisa, ensure it's an integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    });

    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}