
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { Expert, CreateExpertInput, UpdateExpertInput } from '../../../server/src/schema';
import { UserPlus, Save } from 'lucide-react';

interface ExpertFormProps {
  expert?: Expert | null;
  onSaved: () => void;
}

export function ExpertForm({ expert, onSaved }: ExpertFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExpertInput>({
    full_name: expert?.full_name || '',
    place_of_birth: expert?.place_of_birth || '',
    date_of_birth: expert?.date_of_birth || new Date(),
    address: expert?.address || '',
    email: expert?.email || '',
    phone_number: expert?.phone_number || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (expert) {
        // Update existing expert
        const updateData: UpdateExpertInput = {
          id: expert.id,
          ...formData
        };
        await trpc.updateExpert.mutate(updateData);
      } else {
        // Create new expert
        await trpc.createExpert.mutate(formData);
      }
      onSaved();
    } catch (error) {
      console.error('Failed to save expert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {expert ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          {expert ? 'Edit Expert' : 'Add New Expert'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpertInput) => ({ ...prev, full_name: e.target.value }))
                }
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpertInput) => ({ ...prev, email: e.target.value }))
                }
                required
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpertInput) => ({ ...prev, phone_number: e.target.value }))
                }
                required
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_birth">Place of Birth *</Label>
              <Input
                id="place_of_birth"
                value={formData.place_of_birth}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpertInput) => ({ ...prev, place_of_birth: e.target.value }))
                }
                required
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth.toISOString().split('T')[0]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpertInput) => ({ 
                    ...prev, 
                    date_of_birth: new Date(e.target.value) 
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateExpertInput) => ({ ...prev, address: e.target.value }))
              }
              required
              placeholder="Complete address"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : (expert ? 'Update Expert' : 'Create Expert')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
