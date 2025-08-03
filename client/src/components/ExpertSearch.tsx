
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { Expert, ExpertSearchInput } from '../../../server/src/schema';
import { Search, Filter, X } from 'lucide-react';

interface ExpertSearchProps {
  onSearchResults: (results: Expert[]) => void;
}

export function ExpertSearch({ onSearchResults }: ExpertSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<ExpertSearchInput>({
    search_term: '',
    skills: [],
    education_level: '',
    experience_years_min: undefined,
    experience_years_max: undefined,
    limit: 20,
    offset: 0
  });
  const [skillInput, setSkillInput] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Clean up search data - remove empty strings and convert to proper types
      const cleanSearchData: ExpertSearchInput = {
        ...searchData,
        search_term: searchData.search_term || undefined,
        education_level: searchData.education_level || undefined,
        skills: searchData.skills && searchData.skills.length > 0 ? searchData.skills : undefined
      };
      
      const results = await trpc.searchExperts.query(cleanSearchData);
      onSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !searchData.skills?.includes(skillInput.trim())) {
      setSearchData((prev: ExpertSearchInput) => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSearchData((prev: ExpertSearchInput) => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const clearAllFilters = () => {
    setSearchData({
      search_term: '',
      skills: [],
      education_level: '',
      experience_years_min: undefined,
      experience_years_max: undefined,
      limit: 20,
      offset: 0
    });
    setSkillInput('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Experts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* General Search */}
            <div className="space-y-2">
              <Label htmlFor="search_term">Search Terms</Label>
              <Input
                id="search_term"
                value={searchData.search_term}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchData((prev: ExpertSearchInput) => ({ ...prev, search_term: e.target.value }))
                }
                placeholder="Search by name, skills, education, or experience..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Education Level Filter */}
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select 
                  value={searchData.education_level || 'all'} 
                  onValueChange={(value: string) =>
                    setSearchData((prev: ExpertSearchInput) => ({ 
                      ...prev, 
                      education_level: value === 'all' ? '' : value 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any level</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                    <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                    <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Professional Certification">Professional Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Range (Years)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchData.experience_years_min || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchData((prev: ExpertSearchInput) => ({ 
                        ...prev, 
                        experience_years_min: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
                    }
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchData.experience_years_max || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchData((prev: ExpertSearchInput) => ({ 
                        ...prev, 
                        experience_years_max: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
                  placeholder="Add skill to filter by..."
                  onKeyPress={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Add
                </Button>
              </div>
              
              {searchData.skills && searchData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {searchData.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Results Limit */}
            <div className="space-y-2">
              <Label>Results per page</Label>
              <Select 
                value={searchData.limit.toString()} 
                onValueChange={(value: string) =>
                  setSearchData((prev: ExpertSearchInput) => ({ ...prev, limit: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search Experts'}
              </Button>
              <Button type="button" variant="outline" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• Use general search terms to find experts by name, skills, or experience</p>
          <p>• Combine multiple filters for more specific results</p>
          <p>• Add multiple skills to find experts with any of those skills</p>
          <p>• Use experience range to find experts with specific years of experience</p>
          <p>• Leave fields empty to ignore those filters</p>
        </CardContent>
      </Card>
    </div>
  );
}
