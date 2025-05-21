import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Lightbulb, Send } from 'lucide-react';

const SuggestionsPage = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestionType, setSuggestionType] = useState('new_item');
  const [itemName, setItemName] = useState('');
  const [useCaseDescription, setUseCaseDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let suggestionData = {
      name,
      email,
      suggestion_type: suggestionType,
      status: 'pending',
    };

    if (suggestionType === 'new_item') {
      suggestionData.item_name = itemName;
      suggestionData.use_case_description = useCaseDescription;
    } else if (suggestionType === 'existing_item') {
      suggestionData.item_name = itemName;
      suggestionData.use_case_description = useCaseDescription;
    } else if (suggestionType === 'feedback') {
      suggestionData.feedback = feedback;
    }


    try {
      const response = await fetch('/api/service/suggestions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suggestionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit suggestion');
      }

      toast({
        title: 'Suggestion Submitted!',
        description: 'Thank you for your valuable input. We will review it shortly.',
      });
      setName('');
      setEmail('');
      setSuggestionType('new_item');
      setItemName('');
      setUseCaseDescription('');
      setFeedback('');
    } catch (error) {
      toast({
        title: 'Error Submitting Suggestion',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Suggest an Item or Feedback | Alt Use Case</title>
        <meta name="description" content="Have an idea for a new item, a use case, or general feedback? Share it with Alt Use Case!" />
        <link rel="canonical" href="https://altusecase.com/suggestions" /> 
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="text-center">
          <Lightbulb className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-bold gradient-text">Share Your Ideas!</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Help us grow! Suggest new items, alternative uses, or provide feedback.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Suggestion Form</CardTitle>
            <CardDescription>Let us know what's on your mind.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email">Your Email (Optional)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" />
                </div>
              </div>

              <div>
                <Label htmlFor="suggestionType">Type of Suggestion</Label>
                <select
                  id="suggestionType"
                  value={suggestionType}
                  onChange={(e) => setSuggestionType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="new_item">Suggest a New Item</option>
                  <option value="existing_item">Add Use Case to Existing Item</option>
                  <option value="feedback">General Feedback/Bug Report</option>
                </select>
              </div>

              {suggestionType === 'new_item' && (
                <>
                  <div>
                    <Label htmlFor="itemNameNew">Item Name</Label>
                    <Input id="itemNameNew" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Old CDs" required />
                  </div>
                  <div>
                    <Label htmlFor="useCaseDescriptionNew">Describe an Alternative Use</Label>
                    <Textarea id="useCaseDescriptionNew" value={useCaseDescription} onChange={(e) => setUseCaseDescription(e.target.value)} placeholder="e.g., Use them as coasters or garden reflectors." required />
                  </div>
                </>
              )}

              {suggestionType === 'existing_item' && (
                <>
                  <div>
                    <Label htmlFor="itemNameExisting">Existing Item Name</Label>
                    <Input id="itemNameExisting" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Lemon Juice" required />
                  </div>
                  <div>
                    <Label htmlFor="useCaseDescriptionExisting">Describe the New Alternative Use</Label>
                    <Textarea id="useCaseDescriptionExisting" value={useCaseDescription} onChange={(e) => setUseCaseDescription(e.target.value)} placeholder="e.g., Can be used to clean brass." required />
                  </div>
                </>
              )}

              {suggestionType === 'feedback' && (
                <div>
                  <Label htmlFor="feedback">Your Feedback or Bug Report</Label>
                  <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us about your experience, or any issues you found..." required />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Suggestion
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default SuggestionsPage;
  