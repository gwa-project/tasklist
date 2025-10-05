import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user._id.toString(), user.email, user.name, user.role);

    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
