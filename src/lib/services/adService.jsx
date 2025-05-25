export const getAdSettings = async (slotKey) => {
  try {
    const response = await fetch(`/api/service/ads?op=settings&slotKey=${slotKey}`);

    if (!response.ok) {
      throw new Error('Failed to fetch ad settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ad settings:', error);
    return {
      isEnabled: false,
      publisherId: ''
    };
  }
};

export const getAllAdSettings = async () => {
  try {
    const response = await fetch('/api/service/ads?op=allSettings');

    if (!response.ok) {
      throw new Error('Failed to fetch all ad settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all ad settings:', error);
    return {};
  }
}; 