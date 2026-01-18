import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Retry logic for creating Razorpay orders
async function createOrderWithRetry(options: any, rzp: Razorpay, maxRetries = 2) {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const order = await rzp.orders.create(options);
      return order;
    } catch (error) {
      lastError = error;
      console.error(`Order creation attempt ${attempt + 1} failed:`, error);
      
      // Don't retry on validation errors
      if (error instanceof Error && error.message?.includes('Invalid')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff: 500ms, 1000ms)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if keys are available
    if (!keyId) {
      console.error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not set');
      return NextResponse.json(
        { error: 'Payment gateway is not configured (missing key ID)' },
        { status: 500 }
      );
    }
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json(
        { error: 'Payment gateway is not configured (missing secret)' },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    let razorpay: Razorpay;
    try {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } catch (initError) {
      console.error('Failed to initialize Razorpay:', initError);
      return NextResponse.json(
        { error: 'Failed to initialize payment gateway' },
        { status: 500 }
      );
    }

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
      receipt: (receipt || `rcpt_${Date.now()}`).substring(0, 40), // Ensure max 40 chars
    };

    console.log('Creating Razorpay order:', { amount: amountInPaisa, currency });
    
    // Use retry logic to ensure order creation succeeds
    const order = await createOrderWithRetry(options, razorpay);

    console.log('Razorpay order created successfully:', order.id);

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