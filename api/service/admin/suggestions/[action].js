import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['POST', 'DELETE'], async (req, res) => {
  try {
    const { action } = req.query;
    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Suggestion ID is required' });
    }

    switch (action) {
      case 'update':
        if (!status) {
          return res.status(400).json({ error: 'Status is required' });
        }
        const { error: updateError } = await supabase
          .from('suggestions')
          .update({ 
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        if (updateError) throw updateError;
        return res.status(200).json({ success: true });

      case 'delete':
        const { error: deleteError } = await supabase
          .from('suggestions')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Suggestion operation error:', error);
    return res.status(500).json({ error: error.message });
  }
});