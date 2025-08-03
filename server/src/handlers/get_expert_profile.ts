
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
import { eq } from 'drizzle-orm';

export async function getExpertProfile(expertId: number): Promise<ExpertProfile | null> {
  try {
    // First, check if expert exists
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, expertId))
      .execute();

    if (experts.length === 0) {
      return null;
    }

    const expertData = experts[0];

    // Fetch all related data in parallel
    const [
      educationData,
      workExperienceData,
      skillsData,
      certificationsData,
      projectsData,
      documentsData
    ] = await Promise.all([
      db.select()
        .from(educationTable)
        .where(eq(educationTable.expert_id, expertId))
        .execute(),
      
      db.select()
        .from(workExperienceTable)
        .where(eq(workExperienceTable.expert_id, expertId))
        .execute(),
      
      db.select()
        .from(skillsTable)
        .where(eq(skillsTable.expert_id, expertId))
        .execute(),
      
      db.select()
        .from(certificationsTable)
        .where(eq(certificationsTable.expert_id, expertId))
        .execute(),
      
      db.select()
        .from(projectsTable)
        .where(eq(projectsTable.expert_id, expertId))
        .execute(),
      
      db.select()
        .from(documentsTable)
        .where(eq(documentsTable.expert_id, expertId))
        .execute()
    ]);

    // Convert date fields from strings to Date objects
    const expert = {
      ...expertData,
      date_of_birth: new Date(expertData.date_of_birth)
    };

    const education = educationData;

    const work_experience = workExperienceData.map(item => ({
      ...item,
      start_date: new Date(item.start_date),
      end_date: item.end_date ? new Date(item.end_date) : null
    }));

    const skills = skillsData;

    const certifications = certificationsData.map(item => ({
      ...item,
      expiry_date: item.expiry_date ? new Date(item.expiry_date) : null
    }));

    const projects = projectsData.map(item => ({
      ...item,
      start_date: new Date(item.start_date),
      end_date: item.end_date ? new Date(item.end_date) : null
    }));

    const documents = documentsData;

    return {
      expert,
      education,
      work_experience,
      skills,
      certifications,
      projects,
      documents
    };
  } catch (error) {
    console.error('Get expert profile failed:', error);
    throw error;
  }
}
