import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPaymentSuccessEmail } from '@/lib/email';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { validateGST } from '@/lib/gst-validation';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = await request.json();

    console.log('Payment verification received:', {
      razorpay_order_id,
      razorpay_payment_id,
      customerEmail: orderDetails?.customer?.email,
      hasGST: !!orderDetails?.customer?.gstNumber
    });

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

      // Get user session to save order
      const session = await getServerSession(authOptions);
      let userId = null;
      if (session?.user?.email) {
        await connectDB();
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });
        userId = user?._id;
      }

      // Save order to database if user is logged in
      if (userId) {
        try {
          await connectDB();
          const order = new Order({
            userId,
            items: orderDetails.items,
            totalAmount: orderDetails.totalAmount,
            subtotal: orderDetails.subtotal,
            shippingAmount: orderDetails.shippingAmount,
            gstAmount: orderDetails.gstAmount,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            customer: orderDetails.customer,
            address: orderDetails.address,
          });
          await order.save();
          console.log('Order saved:', order._id);

          // Generate and send PDF invoice if GST is provided and valid
          const gstNumber = orderDetails.customer.gstNumber;
          const isGSTValid = gstNumber && validateGST(gstNumber);
          console.log('GST check:', { gstNumber, isGSTValid });

          if (isGSTValid) {
            try {
              console.log('Generating PDF for GST customer:', orderDetails.customer.email);
              const pdfBuffer = await generateInvoicePDF({
                ...order.toObject(),
                razorpayOrderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                customer: orderDetails.customer,
                items: orderDetails.items,
                totalAmount: orderDetails.totalAmount,
                subtotal: orderDetails.subtotal,
                shippingAmount: orderDetails.shippingAmount,
                gstAmount: orderDetails.gstAmount,
              });
              console.log('PDF generated successfully, size:', pdfBuffer.length);

              // Send invoice email with PDF attachment
              console.log('Sending PDF invoice to:', orderDetails.customer.email);
              await sendPaymentSuccessEmail(
                orderDetails.customer.email,
                {
                  ...orderDetails,
                  orderId: razorpay_order_id,
                  amount: orderDetails.totalAmount,
                  pdfInvoice: pdfBuffer,
                },
                razorpay_payment_id
              );
              console.log('PDF invoice sent to customer');
            } catch (pdfError) {
              console.error('Error generating/sending PDF invoice:', pdfError);
              // Still send regular email if PDF fails
              console.log('PDF failed, sending regular email to:', orderDetails.customer.email);
              await sendPaymentSuccessEmail(
                orderDetails.customer.email,
                {
                  ...orderDetails,
                  orderId: razorpay_order_id,
                  amount: orderDetails.totalAmount
                },
                razorpay_payment_id
              );
            }
          } else {
            console.log('No valid GST, sending regular email to:', orderDetails.customer.email);
            // Send regular confirmation email
            await sendPaymentSuccessEmail(
              orderDetails.customer.email,
              {
                ...orderDetails,
                orderId: razorpay_order_id,
                amount: orderDetails.totalAmount
              },
              razorpay_payment_id
            );
          }
        } catch (dbError) {
          console.error('Error saving order to database:', dbError);
          // Don't fail payment verification if DB save fails
        }
      } else {
        // Send confirmation emails to customer (no DB save for guest users)
        try {
          console.log('Sending email for guest user to:', orderDetails.customer.email);
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
      }

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