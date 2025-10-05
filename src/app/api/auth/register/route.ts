import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    // Validasi
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Nama minimal 2 karakter' },
        { status: 400 }
      );
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email tidak valid' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Buat user baru
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    // Create session
    await createSession(user._id.toString(), user.email, user.name, user.role);

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
