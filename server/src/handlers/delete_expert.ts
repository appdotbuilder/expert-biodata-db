
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteExpert(id: number): Promise<boolean> {
  try {
    // Delete expert record - cascade will handle related records
    const result = await db.delete(expertsTable)
      .where(eq(expertsTable.id, id))
      .returning()
      .execute();

    // Return true if a record was deleted, false if not found
    return result.length > 0;
  } catch (error) {
    console.error('Expert deletion failed:', error);
    throw error;
  }
}
