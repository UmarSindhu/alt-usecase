import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';
import { serialize } from 'cookie';

export default allowMethods(['POST'], async (req, res) => {
  try {
    // Clear cookies
    res.setHeader('Set-Cookie', [
      serialize('sb-access-token', '', {
        path: '/',
        expires: new Date(0)
      }),
      serialize('sb-refresh-token', '', {
        path: '/',
        expires: new Date(0)
      })
    ]);

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: error.message });
  }
});