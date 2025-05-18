import { supabase } from '../src/lib/supabaseClient.js';
import { CATEGORIES } from '../src/lib/constants.js';

export default async function handler(req, res) {
  // 1. Fetch all dynamic use-case slugs (from DB, API, or state)
  // Example: Fetch from a database or JSON file
  const useCases = await fetchUseCases();

  // 2. Static pages (home, about, etc.)
  const staticPages = [
    { url: "/", priority: 1.0 },
    { url: "/about", priority: 0.8 },
    { url: "/suggestions", priority: 0.8 },
    { url: "/category", priority: 0.8 },
    // Add other static routes
  ];

  // 3. Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static Pages -->
      ${staticPages.map(page => `
        <url>
          <loc>https://www.altusecase.com${page.url}</loc>
          <priority>${page.priority}</priority>
          <changefreq>weekly</changefreq>
        </url>
      `).join('')}

      <!-- Dynamic Use Case Pages -->
      ${useCases.map(usecase => `
        <url>
          <loc>https://www.altusecase.com/use/${usecase.slug}</loc>
          <lastmod>${new Date(usecase.updatedAt).toISOString()}</lastmod>
          <priority>0.7</priority>
          <changefreq>monthly</changefreq>
        </url>
      `).join('')}

      <!-- Category Pages -->
      ${CATEGORIES.map(c => c.name `
        <url>
          <loc>https://www.altusecase.com/category/${c.name}</loc>
          <priority>0.7</priority>
          <changefreq>monthly</changefreq>
        </url>
      `).join('')}
    </urlset>`;

  // 4. Return as XML
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
}

// function (replace with real data fetching)
async function fetchUseCases() {
  const { data, error } = await supabase
    .from('items')
    .select('slug') // Only fetch the 'slug' field
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  // Returns an array of slugs: [{ slug: '...' }, ...]
  return data.map(item => item.slug); // Extract just the slug strings
}