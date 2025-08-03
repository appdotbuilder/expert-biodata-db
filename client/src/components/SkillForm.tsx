
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CreateSkillInput } from '../../../server/src/schema';
import { Award, Plus } from 'lucide-react';

interface SkillFormProps {
  expertId: number;
  onSaved: () => void;
}

export function SkillForm({ expertId, onSaved }: SkillFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateSkillInput>({
    expert_id: expertId,
    skill_name: '',
    proficiency_level: 'intermediate'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.createSkill.mutate(formData);
      setFormData({
        expert_id: expertId,
        skill_name: '',
        proficiency_level: 'intermediate'
      });
      setShowForm(false);
      onSaved();
    } catch (error) {
      console.error('Failed to save skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Add Skill
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill_name">Skill Name *</Label>
              <Input
                id="skill_name"
                value={formData.skill_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateSkillInput) => ({ ...prev, skill_name: e.target.value }))
                }
                required
                placeholder="e.g., JavaScript, Project Management, Data Analysis"
              />
            </div>

            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <Select 
                value={formData.proficiency_level || 'intermediate'} 
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') =>
                  setFormData((prev: CreateSkillInput) => ({ ...prev, proficiency_level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Skill'}
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
