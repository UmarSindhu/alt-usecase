import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['POST', 'PUT', 'DELETE'], async (req, res) => {
  try {
    const { action } = req.query;
    const { id, ...categoryData } = req.body;

    switch (action) {
      case 'create':
        const { data, error: createError } = await supabase
          .from('categories')
          .insert(categoryData)
          .select()
          .single();
        if (createError) throw createError;
        return res.status(201).json(data);

      case 'update':
        const { error: updateError } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', id);
        if (updateError) throw updateError;
        return res.status(200).json({ success: true });

      case 'delete':
        await supabase.from('item_categories').delete().eq('category_id', id);
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Category operation error:', error);
    return res.status(500).json({ error: error.message });
  }
});