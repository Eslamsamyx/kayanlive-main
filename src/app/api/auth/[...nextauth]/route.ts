import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Create NextAuth handler
const nextAuthHandler = NextAuth(authOptions);

// Wrap the handler to properly handle Next.js 15 async APIs
async function handler(request: NextRequest, context?: { params: { nextauth: string[] } }) {
  try {
    // For NextAuth v4 compatibility with Next.js 15
    // The errors are warnings and don't affect functionality
    return await nextAuthHandler(request, context);
  } catch (error) {
    console.error('NextAuth handler error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await context.params;
  return handler(request, { params: resolvedParams });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await context.params;
  return handler(request, { params: resolvedParams });
}