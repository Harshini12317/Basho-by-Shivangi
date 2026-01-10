import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPaymentSuccessEmail } from '@/lib/email';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import StaticData from '@/models/StaticData';
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

      // Save workshop registration if applicable
      if (orderDetails.workshop) {
        try {
          await connectDB();
          const Registration = (await import('@/models/Registration')).default;
          const registration = new Registration({
            workshopTitle: orderDetails.workshop,
            name: orderDetails.customer.name,
            email: orderDetails.customer.email,
            phone: orderDetails.customer.phone,
            members: orderDetails.members,
            requests: orderDetails.requests,
            level: orderDetails.level,
            date: orderDetails.date,
            timeSlot: orderDetails.timeSlot,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: orderDetails.totalAmount,
          });
          await registration.save();
          console.log('Registration saved:', registration._id);
        } catch (regError) {
          console.error('Error saving registration:', regError);
        }
      }

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

          if (isGSTValid) {
            try {
              // Fetch HSN code from static data
              const staticData = await StaticData.findOne();
              const hsnCode = staticData?.hsnCode || '';

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
                hsnCode,
              });

              // Send invoice email with PDF attachment
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
            } catch (pdfError) {
              console.error('Error generating/sending PDF invoice:', pdfError);
              // Still send regular email if PDF fails
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