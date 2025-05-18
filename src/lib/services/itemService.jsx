import { supabase } from '@/lib/supabaseClient';

// API Keys (store in environment variables)
// const PEXELS_API_KEY = import.meta.env.VITE_PUBLIC_PEXELS_API_KEY;
// const DEEPSEEK_API_KEY = import.meta.env.VITE_PUBLIC_DEEPSEEK_API_KEY;

export const getItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      uses:use_cases(*),
      tags:item_tags(tags(name)),
      categories:item_categories(categories(name, slug))
    `)
    .order('created_at', { ascending: false, foreignTable: 'use_cases' });


  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data.map(item => ({
    ...item,
    tags: item.tags.map(t => t.tags.name),
    category: item.categories[0]?.categories.slug, 
    uses: item.uses || [], 
  }));
};

export const getRecentItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      uses:use_cases(*),
      tags:item_tags(tags(name)),
      categories:item_categories(categories(name, slug))
    `)
    .order('created_at', { ascending: false })
    .limit(9)  // Add this line to limit to 9 most recent items
    .order('created_at', { ascending: false, foreignTable: 'use_cases' });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data.map(item => ({
    ...item,
    tags: item.tags.map(t => t.tags.name),
    category: item.categories[0]?.categories.slug, 
    uses: item.uses || [], 
  }));
};

export const getItemBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      uses:use_cases(*),
      tags:item_tags(tags(name)),
      categories:item_categories(categories(name, slug))
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; 
    console.error('Error fetching item by slug:', error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    tags: data.tags.map(t => t.tags.name),
    categories: data.categories.map(c => c.categories), // Return all categories with name and slug
    uses: data.uses || [], 
  };
};

export const getItemsByCategory = async (categorySlug) => {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError || !category) {
    console.error('Error fetching category or category not found:', categoryError);
    return [];
  }

  const { data, error } = await supabase
    .from('item_categories')
    .select(`
      items (
        *,
        uses:use_cases(*),
        tags:item_tags(tags(name))
      )
    `)
    .eq('category_id', category.id);
    
  if (error) {
    console.error('Error fetching items by category:', error);
    return [];
  }
  return data.map(ic => ({
    ...ic.items,
    tags: ic.items.tags.map(t => t.tags.name),
    category: categorySlug,
    uses: ic.items.uses || [], 
  }));
};

export const getItemsByTag = async (tagName) => {
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName)
    .single();

  if (tagError || !tag) {
    console.error('Error fetching tag or tag not found:', tagError);
    return [];
  }

  const { data, error } = await supabase
    .from('item_tags')
    .select(`
      items (
        *,
        uses:use_cases(*),
        tags:item_tags(tags(name))
      )
    `)
    .eq('tag_id', tag.id);
    
  if (error) {
    console.error('Error fetching items by tag:', error);
    return [];
  }
  return data.map(it => ({
    ...it.items,
    tags: it.items.tags.map(t => t.tags.name),
    uses: it.items.uses || [], 
  }));
};

export const generateAndStoreItem = async (itemName) => {
  try {
    const response = await fetch('/api/generateItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemName }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling generateItem API:', error);
    return null;
  }
};


export const getRandomItem = async () => {
  const { data, error } = await supabase.rpc('get_random_item'); 
  if (error || !data || data.length === 0) {
    console.error('Error fetching random item via RPC or no items available:', error);
    
    const { data: allItems, error: allItemsError } = await supabase.from('items').select('slug');
    if (allItemsError || !allItems || allItems.length === 0) {
      console.error('Fallback: Error fetching all item slugs or no items exist:', allItemsError);
      return null;
    }
    const randomSlug = allItems[Math.floor(Math.random() * allItems.length)].slug;
    return getItemBySlug(randomSlug);
  }
  return getItemBySlug(data[0].slug);
};

export const updateItem = async (itemSlug, itemData) => {
  const { uses, tags, category, ...mainItemData } = itemData; 

  const { data: currentItem, error: fetchCurrentError } = await supabase
    .from('items')
    .select('id')
    .eq('slug', itemSlug)
    .single();

  if (fetchCurrentError || !currentItem) {
    console.error('Error fetching current item for update or item not found:', fetchCurrentError);
    return null;
  }
  const itemId = currentItem.id;

  const { data: updatedItem, error: itemError } = await supabase
    .from('items')
    .update(mainItemData)
    .eq('id', itemId)
    .select()
    .single();

  if (itemError) {
    console.error('Error updating item:', itemError);
    return null;
  }

  
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

  
  if (tags) {
    await supabase.from('item_tags').delete().eq('item_id', itemId);
    for (const tagName of tags) {
      let { data: tag } = await supabase.from('tags').select('id').eq('name', tagName).single();
      if (!tag) {
        const { data: newTag, error: newTagError } = await supabase.from('tags').insert({ name: tagName }).select().single();
        if (newTagError) { console.error("Error creating new tag:", newTagError); continue;}
        tag = newTag;
      }
      if (tag) {
        const {error: itemTagErr} = await supabase.from('item_tags').insert({ item_id: itemId, tag_id: tag.id });
        if (itemTagErr && itemTagErr.code !== '23505') console.error("Error linking tag to item:", itemTagErr);
      }
    }
  }
  return getItemBySlug(updatedItem.slug); 
};

export const deleteItem = async (itemSlug) => {
  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('id')
    .eq('slug', itemSlug)
    .single();

  if (fetchError || !item) {
    console.error('Error fetching item for deletion or item not found:', fetchError);
    return false;
  }

  await supabase.from('item_tags').delete().eq('item_id', item.id);
  await supabase.from('item_categories').delete().eq('item_id', item.id);
  await supabase.from('use_cases').delete().eq('item_id', item.id);

  const { error: deleteError } = await supabase
    .from('items')
    .delete()
    .eq('id', item.id);

  if (deleteError) {
    console.error('Error deleting item:', deleteError);
    return false;
  }
  return true;
};

export const voteOnUseCase = async (useCaseId, voteType) => {
  const { data: useCase, error: fetchError } = await supabase
    .from('use_cases')
    .select('votes_yes, votes_no')
    .eq('id', useCaseId)
    .single();

  if (fetchError || !useCase) {
    console.error('Error fetching use case for voting or use case not found:', fetchError);
    return false;
  }

  let updateData = {};
  if (voteType === 'yes') {
    updateData = { votes_yes: (useCase.votes_yes || 0) + 1 };
  } else if (voteType === 'no') {
    updateData = { votes_no: (useCase.votes_no || 0) + 1 };
  } else {
    return false; 
  }

  const { error: updateError } = await supabase
    .from('use_cases')
    .update(updateData)
    .eq('id', useCaseId);

  if (updateError) {
    console.error('Error updating vote count:', updateError);
    return false;
  }
  return true;
};
