
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import type { Document, CreateDocumentInput } from '../../../server/src/schema';
import { FileText, Upload, Trash2, Download, Plus } from 'lucide-react';

interface DocumentManagerProps {
  expertId: number;
}

export function DocumentManager({ expertId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateDocumentInput>({
    expert_id: expertId,
    document_name: '',
    document_type: 'other',
    file_path: '',
    file_size: 0,
    mime_type: ''
  });

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getExpertDocuments.query({ expertId });
      setDocuments(result);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [expertId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Real implementation would handle file upload here
      const submitDocument: CreateDocumentInput = {
        ...formData,
        file_path: `/uploads/${expertId}/${formData.document_name}`,
        file_size: 1024,
        mime_type: 'application/pdf'
      };
      
      await trpc.createDocument.mutate(submitDocument);
      setFormData({
        expert_id: expertId,
        document_name: '',
        document_type: 'other',
        file_path: '',
        file_size: 0,
        mime_type: ''
      });
      setShowForm(false);
      loadDocuments();
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      setIsLoading(true);
      await trpc.deleteDocument.mutate({ id: documentId });
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'cv': return 'bg-blue-100 text-blue-800';
      case 'certificate': return 'bg-green-100 text-green-800';
      case 'portfolio': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Management
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document_name">Document Name *</Label>
                    <Input
                      id="document_name"
                      value={formData.document_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateDocumentInput) => ({ ...prev, document_name: e.target.value }))
                      }
                      required
                      placeholder="e.g., John_Doe_Resume_2024.pdf"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <Select 
                      value={formData.document_type || 'other'} 
                      onValueChange={(value: 'cv' | 'certificate' | 'portfolio' | 'other') =>
                        setFormData((prev: CreateDocumentInput) => ({ ...prev, document_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cv">CV/Resume</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_input">File *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">
                      <strong>Note:</strong> File upload is not implemented in this demo.
                    </p>
                    <p className="text-sm text-gray-500">
                      In a real application, you would drag & drop files here or click to browse.
                    </p>
                    <Input
                      id="file_input"
                      type="file"
                      className="mt-4"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">Upload documents like CVs, certificates, or portfolios</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{doc.document_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge className={getDocumentTypeColor(doc.document_type)}>
                        {doc.document_type.toUpperCase()}
                      </Badge>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{doc.document_name}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
