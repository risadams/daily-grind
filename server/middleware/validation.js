// Middleware for validating task requests
const validateTaskInput = (req, res, next) => {
  const { title } = req.body;
  
  // Validate required fields
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  // Validate status if provided
  if (req.body.status) {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
  }
  
  // Validate priority if provided
  if (req.body.priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.priority)) {
      return res.status(400).json({ 
        error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
      });
    }
  }
  
  // If all validations pass, proceed
  next();
};

// Middleware for rate limiting (simple implementation)
const rateLimiter = (req, res, next) => {
  // This would be replaced with a more robust rate limiting solution in production
  const apiCallsFromUser = req.user.apiCalls || 0;
  
  if (apiCallsFromUser > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }
  
  next();
};

module.exports = {
  validateTaskInput,
  rateLimiter
};