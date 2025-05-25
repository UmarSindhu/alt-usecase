import { initializeDefaultCategories } from '@/lib/services/categoryService';

export const seedSampleData = async () => {
  try {
    // First initialize categories
    await initializeDefaultCategories();

    // Then trigger the bulk seed operation
    const response = await fetch('/api/service/admin?op=seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to seed data');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};