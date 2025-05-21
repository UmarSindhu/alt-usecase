export const getItems = async () => {
  try {
    const response = await fetch('/api/service/items/getItems', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling getItems API:', error);
    throw error;
  }
};

export const getRecentItems = async () => {
  try {
    const response = await fetch('/api/service/items/getRecentItems', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recent items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling getRecentItems API:', error);
    // Return empty array to match original function behavior
    return [];
  }
};

export const getItemBySlug = async (slug) => {
  try {
    const response = await fetch(`/api/service/items/slug/${slug}`);
    
    if (!response.ok) {
      // Handle server errors (500, etc.)
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // API now returns null for not found items
    if (data === null) {
      return null;
    }
    return data;
    
  } catch (error) {
    console.error('Error fetching item from getItemBySlug:', error);
    return null;
  }
};

export const getItemsByCategory = async (categorySlug) => {
  try {
    const response = await fetch(`/api/service/items/category/${categorySlug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // Return empty array for not found (matches original behavior)
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch category items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling getItemsByCategory API:', error);
    return []; // Match original error behavior
  }
};

export const getItemsByTag = async (tagName) => {
  try {
    const response = await fetch(`/api/service/items/tag/${encodeURIComponent(tagName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // Return empty array for not found
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tag items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling getItemsByTag API:', error);
    return []; // Match original error behavior
  }
};

export const generateAndStoreItem = async (itemName) => {
  try {
    const response = await fetch('/api/service/items/generateItem', {
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
  try {
    const response = await fetch('/api/service/items/getRandomItem', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get random item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling getRandomItem API:', error);
    return null;
  }
};

export const updateItem = async (itemSlug, itemData) => {
  try {
    const response = await fetch('/api/service/items/updateItem', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemSlug, itemData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (itemSlug) => {
  try {
    const response = await fetch('/api/service/items/deleteItem', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemSlug }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const voteOnUseCase = async (useCaseId, voteType) => {
  try {
    const response = await fetch('/api/service/items/voteOnUseCase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ useCaseId, voteType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit vote');
    }

    return await response.json();
  } catch (error) {
    console.error('Error voting on use case:', error);
    throw error;
  }
};
