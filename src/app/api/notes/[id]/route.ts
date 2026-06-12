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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingNote = await db.notes.findById(id);
    if (!existingNote) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Check ownership or sharing permission (simplified: owner or shared can edit)
    const user = await db.users.findById(userId);
    if (existingNote.userId !== userId && (!user || !existingNote.sharedWith?.includes(user.email))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.notes.update(id, body);
    return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingNote = await db.notes.findById(id);

    if (!existingNote) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.notes.delete(id);
    return NextResponse.json({ success: true });
}
