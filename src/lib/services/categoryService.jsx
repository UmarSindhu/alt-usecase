
    import { supabase } from '@/lib/supabaseClient';
    import { CATEGORIES as DEFAULT_CATEGORIES_WITH_ICONS } from '@/lib/constants';
    import { Package } from 'lucide-react';

    export const initializeDefaultCategories = async () => {
      const { data: existingCategories, error: fetchError } = await supabase
        .from('categories')
        .select('slug');

      if (fetchError) {
        console.error('Error fetching existing categories:', fetchError);
        return;
      }

      const existingSlugs = existingCategories.map(c => c.slug);
      const categoriesToInsert = DEFAULT_CATEGORIES_WITH_ICONS
        .filter(dc => !existingSlugs.includes(dc.slug))
        .map(category => ({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon_name: category.icon.displayName || category.icon.name || 'Package', 
        }));

      if (categoriesToInsert.length > 0) {
        const { error } = await supabase.from('categories').insert(categoriesToInsert);
        if (error) {
          console.error('Error initializing default categories:', error);
        } else {
          console.log('Default categories initialized in Supabase.');
        }
      }
    };

    export const getCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories from Supabase:', error);
        return DEFAULT_CATEGORIES_WITH_ICONS.map(c => ({...c, icon: c.icon || Package })); 
      }
      return data.map(c => {
        const iconComponent = DEFAULT_CATEGORIES_WITH_ICONS.find(dc => dc.slug === c.slug)?.icon || Package;
        return {...c, icon: iconComponent };
      });
    };
    
    export const getTags = async () => {
      const { data, error } = await supabase.from('tags').select('*');
      if (error) {
        console.error('Error fetching tags from Supabase:', error);
      }
      return data;
    };

    export const getCategoriesWithCounts = async (limit = 'all') => {
      // Always fetch all categories to ensure accurate sorting
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          item_categories (
            count
          )
        `);

      if (error) {
        console.error('Error fetching categories with counts:', error);
        return DEFAULT_CATEGORIES_WITH_ICONS.map(c => ({
          ...c, 
          icon: c.icon || Package,
          item_count: 0
        }));
      }

      const mapped = data.map(c => {
        const iconComponent = DEFAULT_CATEGORIES_WITH_ICONS.find(dc => dc.slug === c.slug)?.icon || Package;
        return {
          ...c,
          icon: iconComponent,
          item_count: c.item_categories[0]?.count || 0
        };
      });

      const sorted = mapped.sort((a, b) => b.item_count - a.item_count);

      // Apply limit only after sorting
      return limit !== 'all' && Number.isInteger(limit) ? sorted.slice(0, limit) : sorted;
    };
