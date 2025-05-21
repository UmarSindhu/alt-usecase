import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['PUT'], async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { itemSlug, itemData } = req.body;

  if (!itemSlug || !itemData) {
    return res.status(400).json({ error: 'itemSlug and itemData are required' });
  }

  try {
    const { uses, tags, category, ...mainItemData } = itemData; 

    // Fetch current item
    const { data: currentItem, error: fetchCurrentError } = await supabase
      .from('items')
      .select('id')
      .eq('slug', itemSlug)
      .single();

    if (fetchCurrentError || !currentItem) {
      console.error('Error fetching current item:', fetchCurrentError);
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemId = currentItem.id;

    // Update main item data
    const { data: updatedItem, error: itemError } = await supabase
      .from('items')
      .update(mainItemData)
      .eq('id', itemId)
      .select()
      .single();

    if (itemError) {
      console.error('Error updating item:', itemError);
      return res.status(500).json({ error: 'Failed to update item' });
    }

    // Handle uses cases
    if (uses) {
      await supabase.from('use_cases').delete().eq('item_id', itemId);
      const usesToInsert = uses.map(u => ({
        item_id: itemId,
        title: u.title,
        description: u.description,
        difficulty: u.difficulty,
        image_url: u.image_url || null,
        affiliate_link: u.affiliate_link || null,
        votes_yes: u.votes_yes || 0,
        votes_no: u.votes_no || 0,
      }));
      const { error: usesError } = await supabase.from('use_cases').insert(usesToInsert);
      if (usesError) console.error('Error updating uses:', usesError);
    }

    // Handle tags
    if (tags) {
      await supabase.from('item_tags').delete().eq('item_id', itemId);
      for (const tagName of tags) {
        let { data: tag } = await supabase.from('tags').select('id').eq('name', tagName).single();
        if (!tag) {
          const { data: newTag, error: newTagError } = await supabase.from('tags')
            .insert({ name: tagName })
            .select()
            .single();
          if (newTagError) { 
            console.error("Error creating new tag:", newTagError); 
            continue;
          }
          tag = newTag;
        }
        if (tag) {
          const { error: itemTagErr } = await supabase.from('item_tags')
            .insert({ item_id: itemId, tag_id: tag.id });
          if (itemTagErr && itemTagErr.code !== '23505') {
            console.error("Error linking tag to item:", itemTagErr);
          }
        }
      }
    }

    // Fetch the updated item with all relations
    const { data: fullItem, error: fetchError } = await supabase
      .from('items')
      .select(`
        *,
        use_cases(*),
        item_tags(
          tags(*)
        )
      `)
      .eq('slug', updatedItem.slug)
      .single();

    if (fetchError) {
      console.error('Error fetching updated item:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch updated item' });
    }

    return res.status(200).json(fullItem);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});