import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { generateToken } from '../../../../lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, otp } = await request.json();
    
    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if OTP matches and is not expired
    const now = new Date();
    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < now) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired OTP. Please request a new one.' 
        },
        { status: 400 }
      );
    }

    // Clear the OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Create HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authMethod: user.authMethod
      }
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
