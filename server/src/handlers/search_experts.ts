
import { db } from '../db';
import { expertsTable, skillsTable, educationTable, workExperienceTable } from '../db/schema';
import { type ExpertSearchInput, type Expert } from '../schema';
import { eq, and, or, ilike, gte, lte, desc, SQL, sql } from 'drizzle-orm';

export async function searchExperts(input: ExpertSearchInput): Promise<Expert[]> {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    // Text search across name, skills, education, and work experience
    if (input.search_term) {
      const searchTerm = `%${input.search_term}%`;
      
      // Create individual search conditions
      const nameCondition = ilike(expertsTable.full_name, searchTerm);
      
      const skillsCondition = sql`${expertsTable.id} IN (
        SELECT expert_id FROM ${skillsTable} 
        WHERE ${ilike(skillsTable.skill_name, searchTerm)}
      )`;

      const educationCondition = sql`${expertsTable.id} IN (
        SELECT expert_id FROM ${educationTable} 
        WHERE ${ilike(educationTable.level, searchTerm)} 
           OR ${ilike(educationTable.major, searchTerm)} 
           OR ${ilike(educationTable.institution, searchTerm)}
      )`;

      const workCondition = sql`${expertsTable.id} IN (
        SELECT expert_id FROM ${workExperienceTable} 
        WHERE ${ilike(workExperienceTable.company_name, searchTerm)} 
           OR ${ilike(workExperienceTable.position, searchTerm)} 
           OR ${ilike(workExperienceTable.job_description, searchTerm)}
      )`;

      // Combine all search conditions with OR - use sql template to ensure valid SQL
      const searchCondition = sql`(
        ${nameCondition} OR 
        ${skillsCondition} OR 
        ${educationCondition} OR 
        ${workCondition}
      )`;
      
      conditions.push(searchCondition);
    }

    // Filter by specific skills - must have ALL specified skills
    if (input.skills && input.skills.length > 0) {
      for (const skill of input.skills) {
        conditions.push(
          sql`${expertsTable.id} IN (
            SELECT expert_id FROM ${skillsTable} 
            WHERE ${ilike(skillsTable.skill_name, `%${skill}%`)}
          )`
        );
      }
    }

    // Filter by education level
    if (input.education_level) {
      conditions.push(
        sql`${expertsTable.id} IN (
          SELECT expert_id FROM ${educationTable} 
          WHERE ${ilike(educationTable.level, `%${input.education_level}%`)}
        )`
      );
    }

    // Filter by years of experience range
    if (input.experience_years_min !== undefined || input.experience_years_max !== undefined) {
      const currentYear = new Date().getFullYear();
      
      if (input.experience_years_min !== undefined) {
        const minStartYear = currentYear - input.experience_years_min;
        conditions.push(
          sql`${expertsTable.id} IN (
            SELECT expert_id FROM ${workExperienceTable} 
            WHERE EXTRACT(YEAR FROM start_date) <= ${minStartYear}
          )`
        );
      }
      
      if (input.experience_years_max !== undefined) {
        const maxStartYear = currentYear - input.experience_years_max;
        conditions.push(
          sql`${expertsTable.id} IN (
            SELECT expert_id FROM ${workExperienceTable} 
            WHERE EXTRACT(YEAR FROM start_date) >= ${maxStartYear}
          )`
        );
      }
    }

    // Build the final query step by step
    const baseQuery = db.select().from(expertsTable);

    // Apply conditions if any exist
    const queryWithConditions = conditions.length > 0 
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;

    // Apply ordering and pagination
    const results = await queryWithConditions
      .orderBy(desc(expertsTable.created_at))
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    // Convert date fields properly - date_of_birth comes as string from DB but needs to be Date for schema
    return results.map(expert => ({
      ...expert,
      date_of_birth: new Date(expert.date_of_birth), // Convert string to Date
      created_at: expert.created_at, // Already Date
      updated_at: expert.updated_at  // Already Date
    }));
  } catch (error) {
    console.error('Expert search failed:', error);
    throw error;
  }
}
