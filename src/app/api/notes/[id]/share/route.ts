import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const existingNote = db.notes.findById(id);
    if (!existingNote) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sharedWith = existingNote.sharedWith || [];
    if (!sharedWith.includes(email)) {
        sharedWith.push(email);
        db.notes.update(id, { sharedWith });
    }

    return NextResponse.json({ success: true, sharedWith });
}
