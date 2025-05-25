import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, Trash2, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';

const AdminSuggestionsTab = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/service/admin?op=suggestions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      toast({ title: "Error fetching suggestions", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const updateSuggestionStatus = async (suggestionId, newStatus) => {
    try {
      const response = await fetch('/api/service/admin?op=updateSuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestionId, status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      fetchSuggestions();
      toast({ title: "Success", description: `Suggestion status updated to ${newStatus}.` });
    } catch (error) {
      toast({ title: "Error updating suggestion", description: error.message, variant: "destructive" });
    }
  };

  const deleteSuggestion = async (suggestionId) => {
    try {
      const response = await fetch('/api/service/admin?op=deleteSuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestionId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      fetchSuggestions();
      toast({ title: "Success", description: "Suggestion deleted successfully." });
    } catch (error) {
      toast({ title: "Error deleting suggestion", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Inbox className="mr-2 h-5 w-5 text-primary" />User Suggestions</CardTitle>
        <CardDescription>Review and manage suggestions submitted by users.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4">Loading suggestions...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No suggestions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{suggestion.type}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium truncate">{suggestion.title || suggestion.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{suggestion.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteSuggestion(suggestion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSuggestionsTab;