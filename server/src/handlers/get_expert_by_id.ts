
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Expert } from '../schema';

export const getExpertById = async (id: number): Promise<Expert | null> => {
  try {
    const results = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const expert = results[0];
    return {
      ...expert,
      // Convert date strings to Date objects
      date_of_birth: new Date(expert.date_of_birth),
      created_at: expert.created_at,
      updated_at: expert.updated_at
    };
  } catch (error) {
    console.error('Get expert by ID failed:', error);
    throw error;
  }
};
