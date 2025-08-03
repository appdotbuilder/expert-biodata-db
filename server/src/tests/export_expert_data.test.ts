
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
import { type ExpertProfile } from '../schema';
import { exportExpertData } from '../handlers/export_expert_data';

// Test data - using string dates for database insertion
const testExpert = {
  full_name: 'John Doe',
  place_of_birth: 'Jakarta',
  date_of_birth: '1990-01-15', // String format for database
  address: 'Jl. Sudirman No. 123',
  email: 'john.doe@example.com',
  phone_number: '+62123456789'
};

describe('exportExpertData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent expert', async () => {
    const result = await exportExpertData(999, 'json');
    expect(result).toBeNull();
  });

  it('should export expert data in JSON format', async () => {
    // Create expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;

    // Add some education data
    await db.insert(educationTable)
      .values({
        expert_id: expertId,
        level: 'Bachelor',
        major: 'Computer Science',
        institution: 'University of Indonesia',
        graduation_year: 2012
      })
      .execute();

    // Add some skills
    await db.insert(skillsTable)
      .values([
        {
          expert_id: expertId,
          skill_name: 'JavaScript',
          proficiency_level: 'advanced'
        },
        {
          expert_id: expertId,
          skill_name: 'Python',
          proficiency_level: 'expert'
        }
      ])
      .execute();

    const result = await exportExpertData(expertId, 'json') as ExpertProfile;

    expect(result).not.toBeNull();
    expect(result.expert.full_name).toEqual('John Doe');
    expect(result.expert.email).toEqual('john.doe@example.com');
    expect(result.expert.date_of_birth).toBeInstanceOf(Date);
    expect(result.education).toHaveLength(1);
    expect(result.education[0].major).toEqual('Computer Science');
    expect(result.skills).toHaveLength(2);
    expect(result.skills[0].skill_name).toEqual('JavaScript');
    expect(result.skills[1].proficiency_level).toEqual('expert');
    expect(result.work_experience).toHaveLength(0);
    expect(result.certifications).toHaveLength(0);
    expect(result.projects).toHaveLength(0);
    expect(result.documents).toHaveLength(0);
  });

  it('should export expert data in PDF format', async () => {
    // Create expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;

    // Add work experience
    await db.insert(workExperienceTable)
      .values({
        expert_id: expertId,
        company_name: 'Tech Corp',
        position: 'Senior Developer',
        start_date: '2020-01-01', // String format for database
        end_date: null,
        job_description: 'Full-stack development'
      })
      .execute();

    const result = await exportExpertData(expertId, 'pdf');

    expect(result).toBeInstanceOf(Buffer);
    
    const pdfContent = (result as Buffer).toString('utf-8');
    expect(pdfContent).toContain('EXPERT PROFILE');
    expect(pdfContent).toContain('John Doe');
    expect(pdfContent).toContain('john.doe@example.com');
    expect(pdfContent).toContain('WORK EXPERIENCE');
    expect(pdfContent).toContain('Tech Corp');
    expect(pdfContent).toContain('Senior Developer');
  });

  it('should export complete expert profile with all related data', async () => {
    // Create expert
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;

    // Add education
    await db.insert(educationTable)
      .values({
        expert_id: expertId,
        level: 'Master',
        major: 'Software Engineering',
        institution: 'ITB',
        graduation_year: 2014
      })
      .execute();

    // Add work experience
    await db.insert(workExperienceTable)
      .values({
        expert_id: expertId,
        company_name: 'StartupXYZ',
        position: 'CTO',
        start_date: '2018-03-01', // String format for database
        end_date: '2023-12-31', // String format for database
        job_description: 'Leading technical team'
      })
      .execute();

    // Add certification
    await db.insert(certificationsTable)
      .values({
        expert_id: expertId,
        certification_name: 'AWS Solutions Architect',
        issuing_body: 'Amazon Web Services',
        year_obtained: 2021,
        expiry_date: '2024-12-31' // String format for database
      })
      .execute();

    // Add project
    await db.insert(projectsTable)
      .values({
        expert_id: expertId,
        project_name: 'E-commerce Platform',
        role_in_project: 'Lead Developer',
        start_date: '2022-01-01', // String format for database
        end_date: '2023-06-30', // String format for database
        description: 'Built scalable e-commerce solution'
      })
      .execute();

    // Add document
    await db.insert(documentsTable)
      .values({
        expert_id: expertId,
        document_name: 'Resume_John_Doe.pdf',
        document_type: 'cv',
        file_path: '/uploads/resume.pdf',
        file_size: 2048,
        mime_type: 'application/pdf'
      })
      .execute();

    const result = await exportExpertData(expertId, 'json') as ExpertProfile;

    expect(result).not.toBeNull();
    expect(result.expert.full_name).toEqual('John Doe');
    expect(result.expert.date_of_birth).toBeInstanceOf(Date);
    expect(result.education).toHaveLength(1);
    expect(result.education[0].level).toEqual('Master');
    expect(result.work_experience).toHaveLength(1);
    expect(result.work_experience[0].company_name).toEqual('StartupXYZ');
    expect(result.work_experience[0].start_date).toBeInstanceOf(Date);
    expect(result.work_experience[0].end_date).toBeInstanceOf(Date);
    expect(result.certifications).toHaveLength(1);
    expect(result.certifications[0].certification_name).toEqual('AWS Solutions Architect');
    expect(result.certifications[0].expiry_date).toBeInstanceOf(Date);
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].project_name).toEqual('E-commerce Platform');
    expect(result.projects[0].start_date).toBeInstanceOf(Date);
    expect(result.projects[0].end_date).toBeInstanceOf(Date);
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].document_name).toEqual('Resume_John_Doe.pdf');
  });

  it('should handle expert with minimal data', async () => {
    // Create expert with minimal data
    const expertResult = await db.insert(expertsTable)
      .values(testExpert)
      .returning()
      .execute();
    
    const expertId = expertResult[0].id;

    const result = await exportExpertData(expertId, 'json') as ExpertProfile;

    expect(result).not.toBeNull();
    expect(result.expert.full_name).toEqual('John Doe');
    expect(result.expert.date_of_birth).toBeInstanceOf(Date);
    expect(result.education).toHaveLength(0);
    expect(result.work_experience).toHaveLength(0);
    expect(result.skills).toHaveLength(0);
    expect(result.certifications).toHaveLength(0);
    expect(result.projects).toHaveLength(0);
    expect(result.documents).toHaveLength(0);
  });
});
