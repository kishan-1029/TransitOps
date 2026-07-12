export function ok(res, data = null, message = 'Success', status = 200) {
  return res.status(status).json({ isOk: true, message, data, status });
}

export function fail(res, message = 'Error', status = 400, data = null) {
  return res.status(status).json({ isOk: false, message, data, status });
}
