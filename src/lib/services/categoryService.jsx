import { CATEGORIES as DEFAULT_CATEGORIES_WITH_ICONS } from '@/lib/constants';
import { Package } from 'lucide-react';

export const initializeDefaultCategories = async (defaultCategories = DEFAULT_CATEGORIES_WITH_ICONS) => {
  try {
    const response = await fetch('/api/service/categories?op=initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        defaultCategories: defaultCategories.map(c => ({
          name: c.name,
          slug: c.slug,
          description: c.description,
          iconName: c.icon?.displayName || c.icon?.name
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initialize categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error initializing categories:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch('/api/service/categories');
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    
    // If API indicates to use defaults
    if (result.useDefault) {
      return DEFAULT_CATEGORIES_WITH_ICONS.map(c => ({
        ...c,
        icon: c.icon || Package
      }));
    }

    // Normal processing
    return result.map(c => {
      const iconComponent = DEFAULT_CATEGORIES_WITH_ICONS
        .find(dc => dc.slug === c.slug)?.icon || Package;
      return {
        ...c,
        icon: iconComponent
      };
    });

  } catch (error) {
    console.error('Fetch error:', error);
    // Fallback to defaults
    return DEFAULT_CATEGORIES_WITH_ICONS.map(c => ({
      ...c,
      icon: c.icon || Package
    }));
  }
};

export const getTags = async () => {
  try {
    const response = await fetch('/api/service/categories?op=tags');
    
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return await response.json();

  } catch (error) {
    console.error('Error fetching tags:', error);
    return []; // Return empty array to maintain consistent return type
  }
};

export const getCategoriesWithCounts = async (limit = 'all') => {
  try {
    const url = `/api/service/categories?op=withCounts${limit !== 'all' ? `&limit=${limit}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    
    // If API indicates to use defaults
    if (data.useDefaults) {
      return DEFAULT_CATEGORIES_WITH_ICONS.map(c => ({
        ...c,
        icon: c.icon || Package,
        item_count: 0
      }));
    }

    // Merge with icons
    return data.map(c => {
      const iconComponent = DEFAULT_CATEGORIES_WITH_ICONS
        .find(dc => dc.slug === c.slug)?.icon || Package;
      return {
        ...c,
        icon: iconComponent
      };
    });

  } catch (error) {
    console.error('Fetch error:', error);
    // Fallback to defaults
    return DEFAULT_CATEGORIES_WITH_ICONS.map(c => ({
      ...c,
      icon: c.icon || Package,
      item_count: 0
    }));
  }
};
