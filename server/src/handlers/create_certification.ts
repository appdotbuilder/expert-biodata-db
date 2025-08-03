
import { db } from '../db';
import { certificationsTable, expertsTable } from '../db/schema';
import { type CreateCertificationInput, type Certification } from '../schema';
import { eq } from 'drizzle-orm';

export const createCertification = async (input: CreateCertificationInput): Promise<Certification> => {
  try {
    // Validate that the expert exists
    const expert = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, input.expert_id))
      .execute();

    if (expert.length === 0) {
      throw new Error(`Expert with id ${input.expert_id} not found`);
    }

    // Insert certification record
    const result = await db.insert(certificationsTable)
      .values({
        expert_id: input.expert_id,
        certification_name: input.certification_name,
        issuing_body: input.issuing_body,
        year_obtained: input.year_obtained,
        expiry_date: input.expiry_date ? input.expiry_date.toISOString().split('T')[0] : null
      })
      .returning()
      .execute();

    // Convert date string back to Date object
    const certification = result[0];
    return {
      ...certification,
      expiry_date: certification.expiry_date ? new Date(certification.expiry_date) : null
    };
  } catch (error) {
    console.error('Certification creation failed:', error);
    throw error;
  }
};
