    import { sampleData } from '@/data/sampleData';
    import { CATEGORIES } from '@/lib/constants';

    const ITEMS_STORAGE_KEY = 'altUseAppItems';

    // Initialize localStorage with sample data if it's empty
    const initializeData = () => {
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (!storedItems || JSON.parse(storedItems).length === 0) {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sampleData));
        return sampleData;
      }
      return JSON.parse(storedItems);
    };
    
    // This function should be called once, perhaps in App.jsx or when useCaseService is first imported.
    // However, to avoid direct execution on import, we'll rely on getItems to initialize.

    export const getItems = () => {
      const items = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (!items) {
        return initializeData();
      }
      try {
        const parsedItems = JSON.parse(items);
        return Array.isArray(parsedItems) ? parsedItems : initializeData();
      } catch (e) {
        console.error("Error parsing items from localStorage", e);
        return initializeData();
      }
    };

    export const getItemBySlug = (slug) => {
      const items = getItems();
      return items.find(item => item.slug === slug);
    };

    export const getItemsByCategory = (categorySlug) => {
      const items = getItems();
      return items.filter(item => item.tags.includes(categorySlug));
    };

    export const getCategories = () => {
      return CATEGORIES;
    };

    export const getRandomItem = () => {
      const items = getItems();
      if (items.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * items.length);
      return items[randomIndex];
    };
    
    export const voteOnUseCase = (itemSlug, useCaseIndex, voteType) => {
      const items = getItems();
      const itemIndex = items.findIndex(i => i.slug === itemSlug);
      if (itemIndex === -1 || !items[itemIndex].uses[useCaseIndex]) {
        return false;
      }

      const useCase = items[itemIndex].uses[useCaseIndex];
      if (!useCase.votes) {
        useCase.votes = { yes: 0, no: 0 };
      }

      if (voteType === 'yes') {
        useCase.votes.yes = (useCase.votes.yes || 0) + 1;
      } else if (voteType === 'no') {
        useCase.votes.no = (useCase.votes.no || 0) + 1;
      }
      
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
      return true;
    };

    // Mock AI Generation
    export const generateAndStoreItem = async (itemName) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const items = getItems();
      const slug = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (items.find(item => item.slug === slug || item.name.toLowerCase() === itemName.toLowerCase())) {
        console.warn(`Item "${itemName}" or slug "${slug}" already exists.`);
        return null; // Item already exists
      }

      // Mocked AI response structure
      const newItem = {
        name: itemName.charAt(0).toUpperCase() + itemName.slice(1), // Capitalize first letter
        slug: slug,
        image_url: "", // Placeholder for Unsplash
        tags: ["ai-generated", "new", CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].slug],
        uses: [
          {
            title: `Creative Use 1 for ${itemName}`,
            description: `This is an AI-generated creative alternative use for ${itemName}. It involves imagination and some basic tools.`,
            difficulty: "Medium",
            votes: { yes: 0, no: 0 },
            image_url: "",
          },
          {
            title: `Practical Hack with ${itemName}`,
            description: `A surprisingly practical hack using ${itemName} to solve a common household problem. Easy to implement.`,
            difficulty: "Easy",
            votes: { yes: 0, no: 0 },
          },
          {
            title: `Unusual Application of ${itemName}`,
            description: `Explore an unconventional way to utilize ${itemName} that you might not have thought of. Requires some experimentation.`,
            difficulty: "Hard",
            votes: { yes: 0, no: 0 },
            affiliateLink: "https://www.amazon.com/s?k=tools"
          }
        ]
      };

      items.push(newItem);
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
      return newItem;
    };
    
    // Ensure data is initialized when the module loads, if not already present.
    // This is a side-effect, but necessary for localStorage initialization logic.
    // To be safer, this could be moved to an explicit init function called in App.jsx.
    (() => {
        const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
        if (!storedItems) {
            localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sampleData));
        } else {
            try {
                const parsed = JSON.parse(storedItems);
                if (!Array.isArray(parsed)) {
                    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sampleData));
                }
            } catch (e) {
                localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(sampleData));
            }
        }
    })();
  