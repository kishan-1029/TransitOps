export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    isOk: false,
    message: err.message || 'Internal server error',
    data: null,
    status,
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    isOk: false,
    message: `Route not found: ${req.method} ${req.path}`,
    data: null,
    status: 404,
  });
}
