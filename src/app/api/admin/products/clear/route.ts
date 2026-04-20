import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';

export async function DELETE() {
  try {
    const ids: string[] = await writeClient.fetch(`*[_type == "product"]._id`);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }
    const tx = writeClient.transaction();
    ids.forEach((id) => tx.delete(id));
    await tx.commit();
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error('Failed to clear products', error);
    return NextResponse.json({ error: 'Failed to clear products' }, { status: 500 });
  }
}
