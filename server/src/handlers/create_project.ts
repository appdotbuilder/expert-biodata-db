
import { db } from '../db';
import { projectsTable, expertsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Validate that the expert exists
    const expert = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, input.expert_id))
      .limit(1)
      .execute();

    if (expert.length === 0) {
      throw new Error('Expert not found');
    }

    // Validate date logic if end_date is provided
    if (input.end_date && input.end_date < input.start_date) {
      throw new Error('End date cannot be before start date');
    }

    // Insert project record - convert Date objects to strings for date columns
    const result = await db.insert(projectsTable)
      .values({
        expert_id: input.expert_id,
        project_name: input.project_name,
        role_in_project: input.role_in_project,
        start_date: input.start_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        end_date: input.end_date ? input.end_date.toISOString().split('T')[0] : null,
        description: input.description
      })
      .returning()
      .execute();

    // Convert date strings back to Date objects
    const project = result[0];
    return {
      ...project,
      start_date: new Date(project.start_date),
      end_date: project.end_date ? new Date(project.end_date) : null
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};
