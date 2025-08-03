
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExpertForm } from '@/components/ExpertForm';
import { ExpertProfile } from '@/components/ExpertProfile';
import { ExpertSearch } from '@/components/ExpertSearch';
import type { Expert } from '../../server/src/schema';
import { 
  Users, 
  UserPlus, 
  Search, 
  FileText, 
  Download,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';

function App() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Expert[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // User role - in production this would come from authentication context
  const [userRole] = useState<'admin' | 'user'>('admin');

  const loadExperts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getExperts.query();
      setExperts(result);
    } catch (error) {
      console.error('Failed to load experts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  const handleCreateExpert = () => {
    setSelectedExpert(null);
    setActiveTab('form');
  };

  const handleEditExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setActiveTab('form');
  };

  const handleViewProfile = (expert: Expert) => {
    setSelectedExpert(expert);
    setActiveTab('profile');
  };

  const handleDeleteExpert = async (expertId: number) => {
    try {
      setIsLoading(true);
      await trpc.deleteExpert.mutate({ id: expertId });
      await loadExperts();
      if (selectedExpert?.id === expertId) {
        setSelectedExpert(null);
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Failed to delete expert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpertSaved = () => {
    loadExperts();
    setActiveTab('overview');
  };

  const handleSearchResults = (results: Expert[]) => {
    setSearchResults(results);
    setIsSearchMode(true);
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const handleExportData = async (expertId: number, format: 'json' | 'pdf') => {
    try {
      const result = await trpc.exportExpertData.query({ expertId, format });
      console.log('Export data:', result);
      alert(`Data exported successfully (${format.toUpperCase()} format)`);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const displayExperts = isSearchMode ? searchResults : experts;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🧑‍💼 Expert Management System
              </h1>
              <p className="text-gray-600">
                Comprehensive biodata database for consulting management services
              </p>
            </div>
            {userRole === 'admin' && (
              <Button onClick={handleCreateExpert} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add New Expert
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search & Filter
            </TabsTrigger>
            {selectedExpert && (
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Profile Details
              </TabsTrigger>
            )}
            {userRole === 'admin' && (
              <TabsTrigger value="form" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {selectedExpert ? 'Edit Expert' : 'Add Expert'}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">
                  {isSearchMode ? 'Search Results' : 'All Experts'}
                </h2>
                <Badge variant="secondary">
                  {displayExperts.length} expert{displayExperts.length !== 1 ? 's' : ''}
                </Badge>
                {isSearchMode && (
                  <Button variant="outline" size="sm" onClick={handleClearSearch}>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="text-gray-500">Loading experts...</div>
              </div>
            ) : displayExperts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isSearchMode ? 'No matching experts found' : 'No experts registered yet'}
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    {isSearchMode 
                      ? 'Try adjusting your search criteria or browse all experts.'
                      : 'Get started by adding your first expert to the database.'
                    }
                  </p>
                  {userRole === 'admin' && !isSearchMode && (
                    <Button onClick={handleCreateExpert}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Expert
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayExperts.map((expert) => (
                  <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(expert.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {expert.full_name}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{expert.email}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-3 w-3" />
                          {expert.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {expert.place_of_birth}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          Born {formatDate(expert.date_of_birth)}
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Added {formatDate(expert.created_at)}
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewProfile(expert)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {userRole === 'admin' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditExpert(expert)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Expert</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {expert.full_name}? 
                                        This action cannot be undone and will remove all associated data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteExpert(expert.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExportData(expert.id, 'pdf')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <ExpertSearch onSearchResults={handleSearchResults} />
          </TabsContent>

          {/* Profile Tab */}
          {selectedExpert && (
            <TabsContent value="profile">
              <ExpertProfile 
                expert={selectedExpert} 
                userRole={userRole}
                onExportData={handleExportData}
              />
            </TabsContent>
          )}

          {/* Form Tab */}
          {userRole === 'admin' && (
            <TabsContent value="form">
              <ExpertForm 
                expert={selectedExpert} 
                onSaved={handleExpertSaved}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default App;
