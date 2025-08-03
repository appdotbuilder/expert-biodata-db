
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CreateWorkExperienceInput } from '../../../server/src/schema';
import { Briefcase, Plus } from 'lucide-react';

interface WorkExperienceFormProps {
  expertId: number;
  onSaved: () => void;
}

export function WorkExperienceForm({ expertId, onSaved }: WorkExperienceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [formData, setFormData] = useState<CreateWorkExperienceInput>({
    expert_id: expertId,
    company_name: '',
    position: '',
    start_date: new Date(),
    end_date: null,
    job_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submitData: CreateWorkExperienceInput = {
        ...formData,
        end_date: isCurrentJob ? null : formData.end_date
      };
      
      await trpc.createWorkExperience.mutate(submitData);
      setFormData({
        expert_id: expertId,
        company_name: '',
        position: '',
        start_date: new Date(),
        end_date: null,
        job_description: ''
      });
      setIsCurrentJob(false);
      setShowForm(false);
      onSaved();
    } catch (error) {
      console.error('Failed to save work experience:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Add Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWorkExperienceInput) => ({ ...prev, company_name: e.target.value }))
                }
                required
                placeholder="Company or organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWorkExperienceInput) => ({ ...prev, position: e.target.value }))
                }
                required
                placeholder="Job title or position"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date.toISOString().split('T')[0]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWorkExperienceInput) => ({ 
                    ...prev, 
                    start_date: new Date(e.target.value) 
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date?.toISOString().split('T')[0] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateWorkExperienceInput) => ({ 
                    ...prev, 
                    end_date: e.target.value ? new Date(e.target.value) : null 
                  }))
                }
                disabled={isCurrentJob}
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="current_job" 
                  checked={isCurrentJob}
                  onCheckedChange={(checked: boolean) => setIsCurrentJob(checked)}
                />
                <Label htmlFor="current_job" className="text-sm">
                  This is my current job
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description *</Label>
            <Textarea
              id="job_description"
              value={formData.job_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateWorkExperienceInput) => ({ ...prev, job_description: e.target.value }))
              }
              required
              placeholder="Describe responsibilities, achievements, and key tasks..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Experience'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
