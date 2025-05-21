import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['POST'], async function handler(req, res) {
  try {
    const { useCaseId, voteType } = req.body;

    // Validate input
    if (!useCaseId || !voteType || !['yes', 'no'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid useCaseId or voteType' });
    }

    // Fetch current vote counts
    const { data: useCase, error: fetchError } = await supabase
      .from('use_cases')
      .select('votes_yes, votes_no')
      .eq('id', useCaseId)
      .single();

    if (fetchError || !useCase) {
      console.error('Error fetching use case:', fetchError);
      return res.status(404).json({ error: 'Use case not found' });
    }

    // Prepare update data
    const updateData = {
      votes_yes: voteType === 'yes' ? (useCase.votes_yes || 0) + 1 : useCase.votes_yes,
      votes_no: voteType === 'no' ? (useCase.votes_no || 0) + 1 : useCase.votes_no,
      updated_at: new Date().toISOString()
    };

    // Update vote count
    const { error: updateError } = await supabase
      .from('use_cases')
      .update(updateData)
      .eq('id', useCaseId);

    if (updateError) {
      console.error('Error updating vote count:', updateError);
      return res.status(500).json({ error: 'Failed to update vote count' });
    }

    return res.status(200).json({ 
      success: true,
      newVotes: updateData
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});