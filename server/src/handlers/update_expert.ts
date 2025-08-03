
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { type UpdateExpertInput, type Expert } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateExpert(input: UpdateExpertInput): Promise<Expert | null> {
  try {
    // Extract id and update fields
    const { id, ...updateFields } = input;

    // If no fields to update, just return the existing expert
    if (Object.keys(updateFields).length === 0) {
      const results = await db.select()
        .from(expertsTable)
        .where(eq(expertsTable.id, id))
        .execute();
      
      if (results.length === 0) {
        return null;
      }

      // Convert date_of_birth string to Date object for return type
      const expert = results[0];
      return {
        ...expert,
        date_of_birth: new Date(expert.date_of_birth)
      };
    }

    // Prepare update data, converting Date to string for date columns
    const updateData: any = { ...updateFields };
    if (updateData.date_of_birth) {
      updateData.date_of_birth = updateData.date_of_birth.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    }
    updateData.updated_at = new Date();

    // Perform the update and return the updated record
    const result = await db.update(expertsTable)
      .set(updateData)
      .where(eq(expertsTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert date_of_birth string to Date object for return type
    const expert = result[0];
    return {
      ...expert,
      date_of_birth: new Date(expert.date_of_birth)
    };
  } catch (error) {
    console.error('Expert update failed:', error);
    throw error;
  }
}
