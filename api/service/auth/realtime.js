import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    res.write(`data: ${JSON.stringify({ user: session?.user || null })}\n\n`);
  });

  req.on('close', () => {
    subscription.unsubscribe();
    res.end();
  });
});