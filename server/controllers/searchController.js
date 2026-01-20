import { searchContextInfo, generateSearchQuery } from '../services/searchService.js';

export const searchTaskContextController = async (req, res, next) => {
  try {
    const { title, description, numResults } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'タイトルを入力してください'
      });
    }

    // Generate optimized search query using AI
    const optimizedQuery = await generateSearchQuery(title, description);

    // Perform search with optimized query
    const searchResults = await searchContextInfo(optimizedQuery, numResults || 5);

    res.json({
      originalTitle: title,
      optimizedQuery,
      ...searchResults
    });
  } catch (error) {
    next(error);
  }
};
