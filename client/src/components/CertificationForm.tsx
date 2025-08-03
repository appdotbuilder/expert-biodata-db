
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CreateCertificationInput } from '../../../server/src/schema';
import { Award, Plus } from 'lucide-react';

interface CertificationFormProps {
  expertId: number;
  onSaved: () => void;
}

export function CertificationForm({ expertId, onSaved }: CertificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hasExpiryDate, setHasExpiryDate] = useState(false);
  const [formData, setFormData] = useState<CreateCertificationInput>({
    expert_id: expertId,
    certification_name: '',
    issuing_body: '',
    year_obtained: new Date().getFullYear(),
    expiry_date: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submitData: CreateCertificationInput = {
        ...formData,
        expiry_date: hasExpiryDate ? formData.expiry_date : null
      };
      
      await trpc.createCertification.mutate(submitData);
      setFormData({
        expert_id: expertId,
        certification_name: '',
        issuing_body: '',
        year_obtained: new Date().getFullYear(),
        expiry_date: null
      });
      setHasExpiryDate(false);
      setShowForm(false);
      onSaved();
    } catch (error) {
      console.error('Failed to save certification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Certification
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Add Certification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certification_name">Certification Name *</Label>
              <Input
                id="certification_name"
                value={formData.certification_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateCertificationInput) => ({ ...prev, certification_name: e.target.value }))
                }
                required
                placeholder="e.g., AWS Solutions Architect, PMP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuing_body">Issuing Body *</Label>
              <Input
                id="issuing_body"
                value={formData.issuing_body}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateCertificationInput) => ({ ...prev, issuing_body: e.target.value }))
                }
                required
                placeholder="e.g., Amazon Web Services, PMI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_obtained">Year Obtained *</Label>
              <Input
                id="year_obtained"
                type="number"
                value={formData.year_obtained}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateCertificationInput) => ({ ...prev, year_obtained: parseInt(e.target.value) || new Date().getFullYear() }))
                }
                min="1950"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date?.toISOString().split('T')[0] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateCertificationInput) => ({ 
                    ...prev, 
                    expiry_date: e.target.value ? new Date(e.target.value) : null 
                  }))
                }
                disabled={!hasExpiryDate}
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="has_expiry" 
                  checked={hasExpiryDate}
                  onCheckedChange={(checked: boolean) => setHasExpiryDate(checked)}
                />
                <Label htmlFor="has_expiry" className="text-sm">
                  This certification has an expiry date
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Certification'}
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
