
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CreateProjectInput } from '../../../server/src/schema';
import { FileText, Plus } from 'lucide-react';

interface ProjectFormProps {
  expertId: number;
  onSaved: () => void;
}

export function ProjectForm({ expertId, onSaved }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);
  const [formData, setFormData] = useState<CreateProjectInput>({
    expert_id: expertId,
    project_name: '',
    role_in_project: '',
    start_date: new Date(),
    end_date: null,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submitData: CreateProjectInput = {
        ...formData,
        end_date: isOngoing ? null : formData.end_date
      };
      
      await trpc.createProject.mutate(submitData);
      setFormData({
        expert_id: expertId,
        project_name: '',
        role_in_project: '',
        start_date: new Date(),
        end_date: null,
        description: ''
      });
      setIsOngoing(false);
      setShowForm(false);
      onSaved();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Add Project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({ ...prev, project_name: e.target.value }))
                }
                required
                placeholder="Name of the project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_in_project">Your Role *</Label>
              <Input
                id="role_in_project"
                value={formData.role_in_project}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({ ...prev, role_in_project: e.target.value }))
                }
                required
                placeholder="e.g., Project Manager, Lead Developer, Consultant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date.toISOString().split('T')[0]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({ 
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
                  setFormData((prev: CreateProjectInput) => ({ 
                    ...prev, 
                    end_date: e.target.value ? new Date(e.target.value) : null 
                  }))
                }
                disabled={isOngoing}
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ongoing_project" 
                  checked={isOngoing}
                  onCheckedChange={(checked: boolean) => setIsOngoing(checked)}
                />
                <Label htmlFor="ongoing_project" className="text-sm">
                  This project is ongoing
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateProjectInput) => ({ ...prev, description: e.target.value }))
              }
              required
              placeholder="Describe the project, your contributions, technologies used, outcomes..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Project'}
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
