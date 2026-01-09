import { body, validationResult } from 'express-validator';

export const validateTodo = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('タイトルは1〜200文字で入力してください'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('説明は1000文字以内で入力してください'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'shopping', 'health', 'other'])
    .withMessage('カテゴリが無効です'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('優先度が無効です'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('完了状態はboolean値である必要があります'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('タグは配列である必要があります')
];

export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('入力値が無効です');
    error.name = 'ValidationError';
    error.details = errors.array();
    return next(error);
  }
  next();
};
