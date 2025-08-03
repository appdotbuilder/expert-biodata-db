
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  expertsTable, 
  educationTable, 
  workExperienceTable, 
  skillsTable, 
  certificationsTable, 
  projectsTable, 
  documentsTable 
} from '../db/schema';
import { deleteExpert } from '../handlers/delete_expert';
import { eq } from 'drizzle-orm';

describe('deleteExpert', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete expert when exists', async () => {
    // Create test expert
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: 'Test Expert',
        place_of_birth: 'Test City',
        date_of_birth: '1990-01-01',
        address: 'Test Address',
        email: 'test@example.com',
        phone_number: '123456789'
      })
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    // Delete expert
    const result = await deleteExpert(expertId);

    expect(result).toBe(true);

    // Verify expert is deleted
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, expertId))
      .execute();

    expect(experts).toHaveLength(0);
  });

  it('should return false when expert does not exist', async () => {
    const result = await deleteExpert(999);

    expect(result).toBe(false);
  });

  it('should cascade delete all related records', async () => {
    // Create test expert
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: 'Test Expert',
        place_of_birth: 'Test City',
        date_of_birth: '1990-01-01',
        address: 'Test Address',
        email: 'test@example.com',
        phone_number: '123456789'
      })
      .returning()
      .execute();

    const expertId = expertResult[0].id;

    // Create related records
    await db.insert(educationTable)
      .values({
        expert_id: expertId,
        level: 'Bachelor',
        major: 'Computer Science',
        institution: 'Test University',
        graduation_year: 2012
      })
      .execute();

    await db.insert(workExperienceTable)
      .values({
        expert_id: expertId,
        company_name: 'Test Company',
        position: 'Developer',
        start_date: '2012-01-01',
        end_date: null,
        job_description: 'Test description'
      })
      .execute();

    await db.insert(skillsTable)
      .values({
        expert_id: expertId,
        skill_name: 'JavaScript',
        proficiency_level: 'advanced'
      })
      .execute();

    await db.insert(certificationsTable)
      .values({
        expert_id: expertId,
        certification_name: 'Test Cert',
        issuing_body: 'Test Body',
        year_obtained: 2020,
        expiry_date: null
      })
      .execute();

    await db.insert(projectsTable)
      .values({
        expert_id: expertId,
        project_name: 'Test Project',
        role_in_project: 'Lead Developer',
        start_date: '2020-01-01',
        end_date: null,
        description: 'Test project description'
      })
      .execute();

    await db.insert(documentsTable)
      .values({
        expert_id: expertId,
        document_name: 'Test CV',
        document_type: 'cv',
        file_path: '/test/path',
        file_size: 1024,
        mime_type: 'application/pdf'
      })
      .execute();

    // Delete expert
    const result = await deleteExpert(expertId);

    expect(result).toBe(true);

    // Verify all related records are deleted
    const education = await db.select()
      .from(educationTable)
      .where(eq(educationTable.expert_id, expertId))
      .execute();

    const workExperience = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.expert_id, expertId))
      .execute();

    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.expert_id, expertId))
      .execute();

    const certifications = await db.select()
      .from(certificationsTable)
      .where(eq(certificationsTable.expert_id, expertId))
      .execute();

    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.expert_id, expertId))
      .execute();

    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.expert_id, expertId))
      .execute();

    expect(education).toHaveLength(0);
    expect(workExperience).toHaveLength(0);
    expect(skills).toHaveLength(0);
    expect(certifications).toHaveLength(0);
    expect(projects).toHaveLength(0);
    expect(documents).toHaveLength(0);
  });
});
