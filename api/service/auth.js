import { supabase } from '#api/supabaseClient';
import { allowMethods } from '#api/apiMiddleware';
import { parse } from 'cookie';

export default allowMethods(['GET', 'POST'], async function handler(req, res) {
  const { method, query } = req;
  const { op } = query;

  // Get session tokens from cookies if they exist
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies['sb-access-token'];
  const refreshToken = cookies['sb-refresh-token'];

  // If we have tokens, set them in the Supabase client
  if (accessToken && refreshToken) {
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    if (!error && session) {
      // Refresh the cookies with the new tokens if they were refreshed
      res.setHeader('Set-Cookie', [
        `sb-access-token=${session.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        `sb-refresh-token=${session.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      ]);
    }
  }

  try {
    // GET operations
    if (method === 'GET') {
      // Get current user session
      if (!op || op === 'session') {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!session) {
          return res.status(200).json({ user: null });
        }

        // Set session cookies with expiry
        res.setHeader('Set-Cookie', [
          `sb-access-token=${session.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
          `sb-refresh-token=${session.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
        ]);

        return res.status(200).json({ user: session.user });
      }
    }

    // POST operations
    if (method === 'POST') {
      // Login
      if (op === 'login') {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Login error:', error);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session cookies with expiry
        res.setHeader('Set-Cookie', [
          `sb-access-token=${data.session.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
          `sb-refresh-token=${data.session.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
        ]);

        return res.status(200).json({ user: data.user });
      }

      // Logout
      if (op === 'logout') {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('Logout error:', error);
          return res.status(500).json({ error: 'Failed to logout' });
        }

        // Clear session cookies
        res.setHeader('Set-Cookie', [
          'sb-access-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
          'sb-refresh-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
        ]);

        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 