
import { db } from '../db';
import { workExperienceTable, expertsTable } from '../db/schema';
import { type CreateWorkExperienceInput, type WorkExperience } from '../schema';
import { eq } from 'drizzle-orm';

export const createWorkExperience = async (input: CreateWorkExperienceInput): Promise<WorkExperience> => {
  try {
    // Validate that the expert exists
    const expert = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, input.expert_id))
      .execute();

    if (expert.length === 0) {
      throw new Error(`Expert with id ${input.expert_id} not found`);
    }

    // Validate that end_date is after start_date if provided
    if (input.end_date && input.end_date <= input.start_date) {
      throw new Error('End date must be after start date');
    }

    // Insert work experience record
    const result = await db.insert(workExperienceTable)
      .values({
        expert_id: input.expert_id,
        company_name: input.company_name,
        position: input.position,
        start_date: input.start_date.toISOString().split('T')[0], // Convert Date to string
        end_date: input.end_date ? input.end_date.toISOString().split('T')[0] : null, // Convert Date to string or null
        job_description: input.job_description
      })
      .returning()
      .execute();

    // Convert date strings back to Date objects for the return type
    const workExperience = result[0];
    return {
      ...workExperience,
      start_date: new Date(workExperience.start_date),
      end_date: workExperience.end_date ? new Date(workExperience.end_date) : null
    };
  } catch (error) {
    console.error('Work experience creation failed:', error);
    throw error;
  }
};
