
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { EducationForm } from '@/components/EducationForm';
import { WorkExperienceForm } from '@/components/WorkExperienceForm';
import { SkillForm } from '@/components/SkillForm';
import { CertificationForm } from '@/components/CertificationForm';
import { ProjectForm } from '@/components/ProjectForm';
import { DocumentManager } from '@/components/DocumentManager';
import type { Expert, ExpertProfile as ExpertProfileType } from '../../../server/src/schema';
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  FileText, 
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building
} from 'lucide-react';

interface ExpertProfileProps {
  expert: Expert;
  userRole: 'admin' | 'user';
  onExportData: (expertId: number, format: 'json' | 'pdf') => void;
}

export function ExpertProfile({ expert, userRole, onExportData }: ExpertProfileProps) {
  const [profile, setProfile] = useState<ExpertProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getExpertProfile.query({ expertId: expert.id });
      setProfile(result);
    } catch (error) {
      console.error('Failed to load expert profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [expert.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleDataAdded = () => {
    loadProfile();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <div className="text-gray-500">Profile not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                {getInitials(expert.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {expert.full_name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {expert.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {expert.phone_number}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {expert.place_of_birth}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Born {formatDate(expert.date_of_birth)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-gray-700">{expert.address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onExportData(expert.id, 'json')}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => onExportData(expert.id, 'pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{profile.education.length}</div>
                <div className="text-sm text-gray-600">Education Records</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{profile.work_experience.length}</div>
                <div className="text-sm text-gray-600">Work Experience</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{profile.skills.length}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{profile.projects.length}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.slice(0, 2).map((edu) => (
                <div key={edu.id} className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">{edu.level} in {edu.major}</div>
                    <div className="text-sm text-gray-600">{edu.institution} ({edu.graduation_year})</div>
                  </div>
                </div>
              ))}
              {profile.work_experience.slice(0, 2).map((work) => (
                <div key={work.id} className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">{work.position}</div>
                    <div className="text-sm text-gray-600">{work.company_name}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          {userRole === 'admin' && (
            <EducationForm expertId={expert.id} onSaved={handleDataAdded} />
          )}
          
          <div className="grid gap-4">
            {profile.education.map((edu) => (
              <Card key={edu.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{edu.level} in {edu.major}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Graduated: {edu.graduation_year}</span>
                        <span>•</span>
                        <span>Added: {formatDate(edu.created_at)}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{edu.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {profile.education.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No education records yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          {userRole === 'admin' && (
            <WorkExperienceForm expertId={expert.id} onSaved={handleDataAdded} />
          )}
          
          <div className="grid gap-4">
            {profile.work_experience.map((work) => (
              <Card key={work.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{work.position}</h3>
                      <p className="text-gray-600">{work.company_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(work.start_date)} - {work.end_date ? formatDate(work.end_date) : 'Present'}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {work.end_date ? 'Past' : 'Current'}
                    </Badge>
                  </div>
                  <p className="text-gray-700">{work.job_description}</p>
                </CardContent>
              </Card>
            ))}
            {profile.work_experience.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No work experience records yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          {userRole === 'admin' && (
            <SkillForm expertId={expert.id} onSaved={handleDataAdded} />
          )}
          
          <div className="grid gap-4">
            {profile.skills.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        className={getProficiencyColor(skill.proficiency_level)}
                      >
                        {skill.skill_name} ({skill.proficiency_level})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No skills recorded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          {userRole === 'admin' && (
            <CertificationForm expertId={expert.id} onSaved={handleDataAdded} />
          )}
          
          <div className="grid gap-4">
            {profile.certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{cert.certification_name}</h3>
                      <p className="text-gray-600">{cert.issuing_body}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Year: {cert.year_obtained}</span>
                        {cert.expiry_date && (
                          <>
                            <span>•</span>
                            <span>Expires: {formatDate(cert.expiry_date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={cert.expiry_date && cert.expiry_date < new Date() ? "destructive" : "secondary"}>
                      {cert.expiry_date && cert.expiry_date < new Date() ? 'Expired' : 'Valid'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {profile.certifications.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No certifications recorded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {userRole === 'admin' && (
            <ProjectForm expertId={expert.id} onSaved={handleDataAdded} />
          )}
          
          <div className="grid gap-4">
            {profile.projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{project.project_name}</h3>
                      <p className="text-blue-600 font-medium">{project.role_in_project}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.start_date)} - {project.end_date ? formatDate(project.end_date) : 'Ongoing'}
                      </div>
                    </div>
                    <Badge variant={project.end_date ? "secondary" : "default"}>
                      {project.end_date ? 'Completed' : 'Ongoing'}
                    </Badge>
                  </div>
                  <p className="text-gray-700">{project.description}</p>
                </CardContent>
              </Card>
            ))}
            {profile.projects.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No projects recorded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Manager */}
      {userRole === 'admin' && (
        <DocumentManager expertId={expert.id} />
      )}
    </div>
  );
}
