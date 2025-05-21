import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    // Get the session token from cookies
    const token = req.cookies['sb-access-token'];
    
    if (!token) {
      return res.status(200).json({ user: null });
    }

    // Verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(200).json({ user: null });
  }
});