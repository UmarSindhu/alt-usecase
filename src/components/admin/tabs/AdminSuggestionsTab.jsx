
    import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
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
          const { data, error } = await supabase
            .from('suggestions')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
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
          const { error } = await supabase
            .from('suggestions')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', suggestionId);
          if (error) throw error;
          fetchSuggestions();
          toast({ title: "Suggestion Updated", description: `Status changed to ${newStatus}.` });
        } catch (error) {
          toast({ title: "Error updating suggestion", description: error.message, variant: "destructive" });
        }
      };
      
      const deleteSuggestion = async (suggestionId) => {
        if (!window.confirm("Are you sure you want to delete this suggestion?")) return;
        try {
            const { error } = await supabase.from('suggestions').delete().eq('id', suggestionId);
            if (error) throw error;
            fetchSuggestions();
            toast({ title: "Suggestion Deleted", description: "Suggestion removed successfully." });
        } catch (error) {
            toast({ title: "Error Deleting Suggestion", description: error.message, variant: "destructive"});
        }
      };

      const getStatusBadge = (status) => {
        switch (status) {
          case 'pending': return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
          case 'approved': return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
          case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
          default: return <Badge variant="secondary">{status}</Badge>;
        }
      };

      if (isLoading) return <p>Loading suggestions...</p>;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Inbox className="mr-2 h-5 w-5 text-primary" />User Suggestions</CardTitle>
            <CardDescription>Review and manage suggestions submitted by users.</CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
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
                  {suggestions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                        {s.name && <div className="font-medium text-foreground">{s.name}</div>}
                        {s.email && <div className="text-xs">{s.email}</div>}
                      </TableCell>
                      <TableCell className="capitalize">{s.suggestion_type?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {s.item_name && <p><strong>Item:</strong> {s.item_name}</p>}
                        {s.use_case_description && <p className="text-sm text-muted-foreground truncate max-w-xs" title={s.use_case_description}><strong>Use:</strong> {s.use_case_description}</p>}
                        {s.feedback && <p className="text-sm text-muted-foreground truncate max-w-xs" title={s.feedback}><strong>Feedback:</strong> {s.feedback}</p>}
                      </TableCell>
                      <TableCell>{getStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {s.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => updateSuggestionStatus(s.id, 'approved')} title="Approve">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => updateSuggestionStatus(s.id, 'rejected')} title="Reject">
                              <XCircle className="h-4 w-4 text-orange-600" />
                            </Button>
                          </>
                        )}
                         <Button variant="ghost" size="sm" onClick={() => deleteSuggestion(s.id)} title="Delete Suggestion">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
  