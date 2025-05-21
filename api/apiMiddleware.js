export function allowMethods(allowedMethods, handler) {
  return async (req, res) => {
    if (!allowedMethods.includes(req.method)) {
      res.setHeader('Allow', allowedMethods);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
    
    return handler(req, res);
  };
}