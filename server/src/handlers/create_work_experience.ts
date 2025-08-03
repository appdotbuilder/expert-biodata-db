
import { type CreateWorkExperienceInput, type WorkExperience } from '../schema';

export async function createWorkExperience(input: CreateWorkExperienceInput): Promise<WorkExperience> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is adding work experience record for an expert.
    // Should validate that the expert exists and end_date is after start_date if provided.
    return Promise.resolve({
        id: 0, // Placeholder ID
        expert_id: input.expert_id,
        company_name: input.company_name,
        position: input.position,
        start_date: input.start_date,
        end_date: input.end_date,
        job_description: input.job_description,
        created_at: new Date()
    } as WorkExperience);
}
