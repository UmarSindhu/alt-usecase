import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';
import { serialize } from 'cookie';

export default allowMethods(['POST'], async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;

    // Set cookies
    res.setHeader('Set-Cookie', [
      serialize('sb-access-token', data.session.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: data.session.expires_in
      }),
      serialize('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      })
    ]);

    return res.status(200).json({ user: data.user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: error.message });
  }
});