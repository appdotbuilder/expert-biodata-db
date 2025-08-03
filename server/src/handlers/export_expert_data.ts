
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

export async function exportExpertData(expertId: number, format: 'json' | 'pdf'): Promise<Buffer | object | null> {
  try {
    // First, check if expert exists
    const experts = await db.select()
      .from(expertsTable)
      .where(eq(expertsTable.id, expertId))
      .execute();

    if (experts.length === 0) {
      return null;
    }

    const expertRaw = experts[0];

    // Fetch all related data
    const [
      educationRaw,
      workExperienceRaw,
      skillsRaw,
      certificationsRaw,
      projectsRaw,
      documentsRaw
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

    // Convert date strings to Date objects for schema compliance
    const expert = {
      ...expertRaw,
      date_of_birth: new Date(expertRaw.date_of_birth)
    };

    const workExperience = workExperienceRaw.map(work => ({
      ...work,
      start_date: new Date(work.start_date),
      end_date: work.end_date ? new Date(work.end_date) : null
    }));

    const certifications = certificationsRaw.map(cert => ({
      ...cert,
      expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null
    }));

    const projects = projectsRaw.map(project => ({
      ...project,
      start_date: new Date(project.start_date),
      end_date: project.end_date ? new Date(project.end_date) : null
    }));

    // Build the complete expert profile
    const expertProfile: ExpertProfile = {
      expert,
      education: educationRaw,
      work_experience: workExperience,
      skills: skillsRaw,
      certifications,
      projects,
      documents: documentsRaw
    };

    if (format === 'json') {
      return expertProfile;
    }

    // For PDF format, generate a simple PDF buffer
    if (format === 'pdf') {
      // Simple PDF content as string (in real implementation, you'd use a PDF library)
      const pdfContent = generatePDFContent(expertProfile);
      
      // Convert string to buffer (simulating PDF generation)
      return Buffer.from(pdfContent, 'utf-8');
    }

    return null;
  } catch (error) {
    console.error('Expert data export failed:', error);
    throw error;
  }
}

function generatePDFContent(profile: ExpertProfile): string {
  const { expert, education, work_experience, skills, certifications, projects, documents } = profile;
  
  let content = `EXPERT PROFILE\n\n`;
  content += `Name: ${expert.full_name}\n`;
  content += `Email: ${expert.email}\n`;
  content += `Phone: ${expert.phone_number}\n`;
  content += `Address: ${expert.address}\n`;
  content += `Place of Birth: ${expert.place_of_birth}\n`;
  content += `Date of Birth: ${expert.date_of_birth.toISOString().split('T')[0]}\n\n`;

  if (education.length > 0) {
    content += `EDUCATION\n`;
    education.forEach(edu => {
      content += `- ${edu.level} in ${edu.major} from ${edu.institution} (${edu.graduation_year})\n`;
    });
    content += `\n`;
  }

  if (work_experience.length > 0) {
    content += `WORK EXPERIENCE\n`;
    work_experience.forEach(work => {
      const endDate = work.end_date ? work.end_date.toISOString().split('T')[0] : 'Present';
      content += `- ${work.position} at ${work.company_name} (${work.start_date.toISOString().split('T')[0]} - ${endDate})\n`;
      content += `  ${work.job_description}\n`;
    });
    content += `\n`;
  }

  if (skills.length > 0) {
    content += `SKILLS\n`;
    skills.forEach(skill => {
      content += `- ${skill.skill_name} (${skill.proficiency_level})\n`;
    });
    content += `\n`;
  }

  if (certifications.length > 0) {
    content += `CERTIFICATIONS\n`;
    certifications.forEach(cert => {
      content += `- ${cert.certification_name} by ${cert.issuing_body} (${cert.year_obtained})\n`;
    });
    content += `\n`;
  }

  if (projects.length > 0) {
    content += `PROJECTS\n`;
    projects.forEach(project => {
      content += `- ${project.project_name} (${project.role_in_project})\n`;
      content += `  ${project.description}\n`;
    });
    content += `\n`;
  }

  if (documents.length > 0) {
    content += `DOCUMENTS\n`;
    documents.forEach(doc => {
      content += `- ${doc.document_name} (${doc.document_type})\n`;
    });
  }

  return content;
}
