
import { db } from '../db';
import { skillsTable, expertsTable } from '../db/schema';
import { type CreateSkillInput, type Skill } from '../schema';
import { eq, and } from 'drizzle-orm';

export const createSkill = async (input: CreateSkillInput): Promise<Skill> => {
  try {
    // Validate that the expert exists
    const existingExpert = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, input.expert_id))
      .execute();

    if (existingExpert.length === 0) {
      throw new Error(`Expert with id ${input.expert_id} not found`);
    }

    // Check for duplicate skill for the same expert
    const existingSkill = await db.select()
      .from(skillsTable)
      .where(and(
        eq(skillsTable.expert_id, input.expert_id),
        eq(skillsTable.skill_name, input.skill_name)
      ))
      .execute();

    if (existingSkill.length > 0) {
      throw new Error(`Skill "${input.skill_name}" already exists for expert ${input.expert_id}`);
    }

    // Insert skill record
    const result = await db.insert(skillsTable)
      .values({
        expert_id: input.expert_id,
        skill_name: input.skill_name,
        proficiency_level: input.proficiency_level
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Skill creation failed:', error);
    throw error;
  }
};
