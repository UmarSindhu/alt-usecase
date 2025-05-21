import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async function handler(req, res) {
  try {
    // First try to get a random item using RPC
    const { data, error } = await supabase.rpc('get_random_item');
    
    if (error || !data?.length) {
      console.error('RPC failed, falling back to manual random selection:', error);
      
      // Fallback: Get all slugs and pick one randomly
      const { data: allItems, error: allItemsError } = await supabase
        .from('items')
        .select('slug');
      
      if (allItemsError || !allItems?.length) {
        console.error('No items available:', allItemsError);
        return res.status(404).json({ error: 'No items available' });
      }
      
      const randomSlug = allItems[Math.floor(Math.random() * allItems.length)].slug;
      return res.status(200).json(randomSlug);
    }
    
    // Success case - redirect to the random item
    return res.status(200).json(data[0].slug);
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});