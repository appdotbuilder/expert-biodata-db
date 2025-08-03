
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { type Expert } from '../schema';

export const getExperts = async (): Promise<Expert[]> => {
  try {
    const results = await db.select()
      .from(expertsTable)
      .execute();

    // Convert date_of_birth from string to Date object
    return results.map(expert => ({
      ...expert,
      date_of_birth: new Date(expert.date_of_birth)
    }));
  } catch (error) {
    console.error('Failed to fetch experts:', error);
    throw error;
  }
};
