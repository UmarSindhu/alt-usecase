import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['DELETE'], async function handler(req, res) {
  try {
    const { itemSlug } = req.body;

    if (!itemSlug) {
      return res.status(400).json({ error: 'itemSlug is required' });
    }

    // Fetch item to get ID
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('id')
      .eq('slug', itemSlug)
      .single();

    if (fetchError || !item) {
      console.error('Error fetching item:', fetchError);
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete related records
    await supabase.from('item_tags').delete().eq('item_id', item.id);
    await supabase.from('item_categories').delete().eq('item_id', item.id);
    await supabase.from('use_cases').delete().eq('item_id', item.id);

    // Delete main item
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      return res.status(500).json({ error: 'Failed to delete item' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});