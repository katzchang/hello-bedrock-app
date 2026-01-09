const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details || []
    });
  }

  if (err.name === 'BedrockError') {
    return res.status(502).json({
      error: 'AI Service Error',
      message: 'AWS Bedrockサービスでエラーが発生しました。後でもう一度お試しください。'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'サーバーエラーが発生しました'
    : err.message;

  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
