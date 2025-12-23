import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPaymentSuccessEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = await request.json();

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      console.log('Payment verified:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        orderDetails
      });

      // Send confirmation emails to customer and owner
      try {
        await sendPaymentSuccessEmail(
          orderDetails.customer.email,
          {
            ...orderDetails,
            orderId: razorpay_order_id,
            amount: orderDetails.totalAmount
          },
          razorpay_payment_id
        );
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Don't fail the payment verification if email fails
      }

      // You can save this to your database here
      // Example: await saveOrderToDatabase(orderDetails);

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}