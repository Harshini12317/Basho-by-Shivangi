import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import CustomOrder from '@/models/CustomOrder';
import { sendCustomOrderPaymentEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customOrderId
    } = await request.json();

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      console.log('Custom order payment verified:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        customOrderId
      });

      await connectDB();

      // Update custom order with payment details
      const updatedOrder = await CustomOrder.findByIdAndUpdate(
        customOrderId,
        {
          status: 'paid',
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          paidAt: new Date()
        },
        { new: true }
      );

      if (!updatedOrder) {
        return NextResponse.json(
          { success: false, error: 'Custom order not found' },
          { status: 404 }
        );
      }

      // Send payment confirmation emails to both customer and admin
      try {
        await sendCustomOrderPaymentEmail(
          updatedOrder.name,
          updatedOrder.email,
          updatedOrder.quotedPrice || 0,
          updatedOrder._id.toString(),
          razorpay_payment_id
        );
      } catch (emailError) {
        console.error('Error sending custom order payment email:', emailError);
        // Continue despite email error - payment is already recorded
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Custom order payment verified and confirmed',
          order: updatedOrder
        },
        { status: 200 }
      );
    } else {
      // Payment verification failed
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in custom order payment verification:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification error' },
      { status: 500 }
    );
  }
}
