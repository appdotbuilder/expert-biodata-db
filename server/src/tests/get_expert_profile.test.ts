
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
import { getExpertProfile } from '../handlers/get_expert_profile';

describe('getExpertProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent expert', async () => {
    const result = await getExpertProfile(999);
    expect(result).toBeNull();
  });

  it('should return expert profile with empty related arrays', async () => {
    // Create expert only
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: 'John Doe',
        place_of_birth: 'Jakarta',
        date_of_birth: '1990-01-01',
        address: '123 Main St',
        email: 'john@example.com',
        phone_number: '123456789'
      })
      .returning()
      .execute();

    const expert = expertResult[0];
    const result = await getExpertProfile(expert.id);

    expect(result).not.toBeNull();
    expect(result!.expert.id).toEqual(expert.id);
    expect(result!.expert.full_name).toEqual('John Doe');
    expect(result!.expert.email).toEqual('john@example.com');
    expect(result!.expert.date_of_birth).toBeInstanceOf(Date);
    expect(result!.expert.date_of_birth.getFullYear()).toEqual(1990);
    expect(result!.education).toHaveLength(0);
    expect(result!.work_experience).toHaveLength(0);
    expect(result!.skills).toHaveLength(0);
    expect(result!.certifications).toHaveLength(0);
    expect(result!.projects).toHaveLength(0);
    expect(result!.documents).toHaveLength(0);
  });

  it('should return complete expert profile with all related data', async () => {
    // Create expert
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: 'Jane Smith',
        place_of_birth: 'Bandung',
        date_of_birth: '1985-05-15',
        address: '456 Oak Ave',
        email: 'jane@example.com',
        phone_number: '987654321'
      })
      .returning()
      .execute();

    const expert = expertResult[0];

    // Create related data
    await Promise.all([
      // Education
      db.insert(educationTable)
        .values({
          expert_id: expert.id,
          level: 'Bachelor',
          major: 'Computer Science',
          institution: 'ITB',
          graduation_year: 2007
        })
        .execute(),

      // Work Experience
      db.insert(workExperienceTable)
        .values({
          expert_id: expert.id,
          company_name: 'Tech Corp',
          position: 'Software Engineer',
          start_date: '2008-01-01',
          end_date: '2012-12-31',
          job_description: 'Developed web applications'
        })
        .execute(),

      // Skills
      db.insert(skillsTable)
        .values({
          expert_id: expert.id,
          skill_name: 'JavaScript',
          proficiency_level: 'advanced'
        })
        .execute(),

      // Certification
      db.insert(certificationsTable)
        .values({
          expert_id: expert.id,
          certification_name: 'AWS Certified',
          issuing_body: 'Amazon',
          year_obtained: 2020,
          expiry_date: '2023-12-31'
        })
        .execute(),

      // Project
      db.insert(projectsTable)
        .values({
          expert_id: expert.id,
          project_name: 'E-commerce Platform',
          role_in_project: 'Lead Developer',
          start_date: '2021-01-01',
          end_date: '2021-06-30',
          description: 'Built scalable e-commerce solution'
        })
        .execute(),

      // Document
      db.insert(documentsTable)
        .values({
          expert_id: expert.id,
          document_name: 'Resume.pdf',
          document_type: 'cv',
          file_path: '/uploads/resume.pdf',
          file_size: 1024000,
          mime_type: 'application/pdf'
        })
        .execute()
    ]);

    const result = await getExpertProfile(expert.id);

    expect(result).not.toBeNull();
    
    // Verify expert data
    expect(result!.expert.id).toEqual(expert.id);
    expect(result!.expert.full_name).toEqual('Jane Smith');
    expect(result!.expert.email).toEqual('jane@example.com');
    expect(result!.expert.place_of_birth).toEqual('Bandung');
    expect(result!.expert.date_of_birth).toBeInstanceOf(Date);
    expect(result!.expert.date_of_birth.getFullYear()).toEqual(1985);
    
    // Verify related data arrays have content
    expect(result!.education).toHaveLength(1);
    expect(result!.education[0].level).toEqual('Bachelor');
    expect(result!.education[0].major).toEqual('Computer Science');
    expect(result!.education[0].graduation_year).toEqual(2007);

    expect(result!.work_experience).toHaveLength(1);
    expect(result!.work_experience[0].company_name).toEqual('Tech Corp');
    expect(result!.work_experience[0].position).toEqual('Software Engineer');
    expect(result!.work_experience[0].start_date).toBeInstanceOf(Date);
    expect(result!.work_experience[0].start_date.getFullYear()).toEqual(2008);
    expect(result!.work_experience[0].end_date).toBeInstanceOf(Date);
    expect(result!.work_experience[0].end_date!.getFullYear()).toEqual(2012);

    expect(result!.skills).toHaveLength(1);
    expect(result!.skills[0].skill_name).toEqual('JavaScript');
    expect(result!.skills[0].proficiency_level).toEqual('advanced');

    expect(result!.certifications).toHaveLength(1);
    expect(result!.certifications[0].certification_name).toEqual('AWS Certified');
    expect(result!.certifications[0].issuing_body).toEqual('Amazon');
    expect(result!.certifications[0].expiry_date).toBeInstanceOf(Date);
    expect(result!.certifications[0].expiry_date!.getFullYear()).toEqual(2023);

    expect(result!.projects).toHaveLength(1);
    expect(result!.projects[0].project_name).toEqual('E-commerce Platform');
    expect(result!.projects[0].role_in_project).toEqual('Lead Developer');
    expect(result!.projects[0].start_date).toBeInstanceOf(Date);
    expect(result!.projects[0].start_date.getFullYear()).toEqual(2021);
    expect(result!.projects[0].end_date).toBeInstanceOf(Date);
    expect(result!.projects[0].end_date!.getMonth()).toEqual(5); // June is month 5 (0-indexed)

    expect(result!.documents).toHaveLength(1);
    expect(result!.documents[0].document_name).toEqual('Resume.pdf');
    expect(result!.documents[0].document_type).toEqual('cv');
    expect(result!.documents[0].file_size).toEqual(1024000);
  });

  it('should handle expert with multiple items in each category', async () => {
    // Create expert
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: 'Multi Expert',
        place_of_birth: 'Surabaya',
        date_of_birth: '1980-03-20',
        address: '789 Pine St',
        email: 'multi@example.com',
        phone_number: '555666777'
      })
      .returning()
      .execute();

    const expert = expertResult[0];

    // Create multiple items in each category
    await Promise.all([
      // Multiple education records
      db.insert(educationTable)
        .values([
          {
            expert_id: expert.id,
            level: 'Bachelor',
            major: 'Mathematics',
            institution: 'UI',
            graduation_year: 2002
          },
          {
            expert_id: expert.id,
            level: 'Master',
            major: 'Data Science',
            institution: 'ITB',
            graduation_year: 2004
          }
        ])
        .execute(),

      // Multiple skills
      db.insert(skillsTable)
        .values([
          {
            expert_id: expert.id,
            skill_name: 'Python',
            proficiency_level: 'expert'
          },
          {
            expert_id: expert.id,
            skill_name: 'React',
            proficiency_level: 'intermediate'
          }
        ])
        .execute()
    ]);

    const result = await getExpertProfile(expert.id);

    expect(result).not.toBeNull();
    expect(result!.education).toHaveLength(2);
    expect(result!.skills).toHaveLength(2);
    
    // Verify specific records exist
    const educationLevels = result!.education.map(e => e.level);
    expect(educationLevels).toContain('Bachelor');
    expect(educationLevels).toContain('Master');

    const skillNames = result!.skills.map(s => s.skill_name);
    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('React');
  });

  it('should handle null date fields correctly', async () => {
    // Create expert
    const expertResult = await db.insert(expertsTable)
      .values({
        full_name: 'Current Worker',
        place_of_birth: 'Medan',
        date_of_birth: '1985-01-01',
        address: '321 Oak St',
        email: 'current@example.com',
        phone_number: '111222333'
      })
      .returning()
      .execute();

    const expert = expertResult[0];

    // Create work experience with null end_date (current job)
    await db.insert(workExperienceTable)
      .values({
        expert_id: expert.id,
        company_name: 'Current Corp',
        position: 'Senior Developer',
        start_date: '2020-01-01',
        end_date: null, // Still working here
        job_description: 'Current position'
      })
      .execute();

    // Create certification with null expiry_date
    await db.insert(certificationsTable)
      .values({
        expert_id: expert.id,
        certification_name: 'Lifetime Cert',
        issuing_body: 'Forever Org',
        year_obtained: 2019,
        expiry_date: null // Never expires
      })
      .execute();

    const result = await getExpertProfile(expert.id);

    expect(result).not.toBeNull();
    expect(result!.work_experience).toHaveLength(1);
    expect(result!.work_experience[0].end_date).toBeNull();
    expect(result!.work_experience[0].start_date).toBeInstanceOf(Date);

    expect(result!.certifications).toHaveLength(1);
    expect(result!.certifications[0].expiry_date).toBeNull();
  });
});
