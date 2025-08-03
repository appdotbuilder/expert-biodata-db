
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CreateEducationInput } from '../../../server/src/schema';
import { GraduationCap, Plus } from 'lucide-react';

interface EducationFormProps {
  expertId: number;
  onSaved: () => void;
}

export function EducationForm({ expertId, onSaved }: EducationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateEducationInput>({
    expert_id: expertId,
    level: '',
    major: '',
    institution: '',
    graduation_year: new Date().getFullYear()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.createEducation.mutate(formData);
      setFormData({
        expert_id: expertId,
        level: '',
        major: '',
        institution: '',
        graduation_year: new Date().getFullYear()
      });
      setShowForm(false);
      onSaved();
    } catch (error) {
      console.error('Failed to save education:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Education Record
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Add Education Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Education Level *</Label>
              <Select 
                value={formData.level || 'bachelor'} 
                onValueChange={(value: string) =>
                  setFormData((prev: CreateEducationInput) => ({ ...prev, level: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Professional Certification">Professional Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study *</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateEducationInput) => ({ ...prev, major: e.target.value }))
                }
                required
                placeholder="e.g., Computer Science, Business Administration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateEducationInput) => ({ ...prev, institution: e.target.value }))
                }
                required
                placeholder="University or school name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year *</Label>
              <Input
                id="graduation_year"
                type="number"
                value={formData.graduation_year}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateEducationInput) => ({ ...prev, graduation_year: parseInt(e.target.value) || new Date().getFullYear() }))
                }
                min="1950"
                max={new Date().getFullYear() + 10}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Education'}
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
