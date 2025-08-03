
import { db } from '../db';
import { educationTable, expertsTable } from '../db/schema';
import { type CreateEducationInput, type Education } from '../schema';
import { eq } from 'drizzle-orm';

export const createEducation = async (input: CreateEducationInput): Promise<Education> => {
  try {
    // Validate that the expert exists
    const expert = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, input.expert_id))
      .execute();

    if (expert.length === 0) {
      throw new Error(`Expert with id ${input.expert_id} not found`);
    }

    // Insert education record
    const result = await db.insert(educationTable)
      .values({
        expert_id: input.expert_id,
        level: input.level,
        major: input.major,
        institution: input.institution,
        graduation_year: input.graduation_year
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Education creation failed:', error);
    throw error;
  }
};
