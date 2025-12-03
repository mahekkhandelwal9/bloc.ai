import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Check if RESEND_API_KEY exists
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is missing!');
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            );
        }

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP in database
        const { error: dbError } = await supabase
            .from('otp_codes')
            .insert({
                email,
                code,
                expires_at: expiresAt.toISOString(),
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to generate code' },
                { status: 500 }
            );
        }

        // Send OTP via email
        try {
            await resend.emails.send({
                from: 'Bloc.ai <onboarding@resend.dev>', // Replace with your verified domain
                to: email,
                subject: 'Your Bloc.ai verification code',
                html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: bold; margin-bottom: 24px;">
              Bloc.ai
            </h1>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Your verification code is:
            </p>
            
            <div style="background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
              <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
                ${code}
              </span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This code will expire in 5 minutes. If you didn't request this code, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Build a smarter, stronger mind — block by block
            </p>
          </div>
        `,
            });
        } catch (emailError: any) {
            console.error('Email error:', emailError);
            return NextResponse.json(
                { error: `Failed to send verification email: ${emailError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'OTP sent successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
