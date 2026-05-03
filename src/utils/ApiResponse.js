/**
 * Standardised API response shape.
 * All endpoints should use this helper instead of raw res.json().
 */
class ApiResponse {
  /**
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*} data
   * @param {object|null} meta  — pagination / extra metadata
   */
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (meta !== null) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static error(res, statusCode = 500, message = 'Internal Server Error', code = null, errors = []) {
    return res.status(statusCode).json({ success: false, message, code, errors });
  }
}

module.exports = ApiResponse;
