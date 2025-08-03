
import { db } from '../db';
import { expertsTable } from '../db/schema';
import { type CreateExpertInput, type Expert } from '../schema';

export const createExpert = async (input: CreateExpertInput): Promise<Expert> => {
  try {
    // Insert expert record - date_of_birth needs to be converted to string
    const result = await db.insert(expertsTable)
      .values({
        full_name: input.full_name,
        place_of_birth: input.place_of_birth,
        date_of_birth: input.date_of_birth.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        address: input.address,
        email: input.email,
        phone_number: input.phone_number
      })
      .returning()
      .execute();

    // Convert date string back to Date object before returning
    const expert = result[0];
    return {
      ...expert,
      date_of_birth: new Date(expert.date_of_birth) // Convert string back to Date
    };
  } catch (error) {
    console.error('Expert creation failed:', error);
    throw error;
  }
};
