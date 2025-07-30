import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { sendOtpEmail } from '../../../../utils/emailService';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();
    
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Find user or create if not exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with new OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.authMethod = 'otp';
      await user.save();
    } else {
      // Create new user with OTP
      user = await User.create({
        email,
        name: email.split('@')[0], // Default name from email
        otp,
        otpExpiry,
        authMethod: 'otp',
      });
    }

    // Send OTP via email
    const emailResult = await sendOtpEmail(email, otp);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Don't send OTP in response in production
      ...(process.env.NODE_ENV === 'development' && { otp }), // Only include OTP in development
    });

  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
