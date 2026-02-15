import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { sendSupportEmail } from '@/lib/stack-reveal/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ATTACHMENTS = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_ATTACHMENTS_BYTES = 20 * 1024 * 1024; // 20MB total

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = (formData.get('email') as string)?.trim();
    const name = (formData.get('name') as string)?.trim();
    const subject = (formData.get('subject') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    if (!email || !name || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, subject, message.' },
        { status: 400 }
      );
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    const attachments: { filename: string; content: string }[] = [];
    const files = formData.getAll('attachments').filter((f): f is File => f instanceof File);
    if (files.length > MAX_ATTACHMENTS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ATTACHMENTS} attachments allowed.` },
        { status: 400 }
      );
    }
    let totalBytes = 0;
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB.` },
          { status: 400 }
        );
      }
      totalBytes += file.size;
    }
    if (totalBytes > MAX_TOTAL_ATTACHMENTS_BYTES) {
      return NextResponse.json(
        { error: 'Total attachment size must not exceed 20MB.' },
        { status: 400 }
      );
    }
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer.toString('base64'),
      });
    }

    const attachmentNames = attachments.map((a) => a.filename);

    // Persist to Firestore first so submission is always stored regardless of email
    const db = getDb();
    const docRef = await db.collection('supportSubmissions').add({
      email,
      name,
      subject,
      message,
      attachmentCount: attachments.length,
      attachmentNames,
      createdAt: Timestamp.now(),
    });

    // Then send email (best-effort; don't fail the request if Resend fails)
    const result = await sendSupportEmail(email, name, subject, message, attachments.length ? attachments : undefined);
    if (result.error) {
      console.error('[Support API] Resend error:', result.error);
    }

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[Support API] Error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
