import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { checkOnboardingStatus } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Verify OTP
        const { data: otpRecord, error: otpError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (otpError || !otpRecord) {
            return NextResponse.json(
                { error: 'Invalid or expired code' },
                { status: 401 }
            );
        }

        // Delete used OTP
        await supabase
            .from('otp_codes')
            .delete()
            .eq('email', email);

        // Check if user exists
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        // Create user if doesn't exist
        if (userError && userError.code === 'PGRST116') {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    email,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                })
                .select()
                .single();

            if (createError) {
                console.error('User creation error:', createError);
                return NextResponse.json(
                    { error: 'Failed to create user' },
                    { status: 500 }
                );
            }

            user = newUser;
        } else if (userError) {
            console.error('User fetch error:', userError);
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            );
        }

        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // Check onboarding status
        const needsOnboarding = !(await checkOnboardingStatus(user.id));

        // Create session using Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
            },
        });

        // For now, we'll use a simple approach and return user data
        // In production, you'd want proper JWT tokens
        const response = NextResponse.json(
            {
                message: 'Verification successful',
                userId: user.id,
                needsOnboarding,
            },
            { status: 200 }
        );

        // Set a cookie with user session
        response.cookies.set('bloc_user_id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
