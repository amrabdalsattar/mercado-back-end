/**
 * Builds a Mongoose query from standard query params and returns pagination meta.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} queryParams   — req.query
 * @param {object} filter        — base Mongoose filter already applied
 * @param {object} [projection]  — optional field projection
 * @param {object} [populate]    — optional populate config
 * @returns {{ docs, meta }}
 */
const paginate = async (Model, queryParams = {}, filter = {}, projection = null, populate = null) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Sorting: e.g. ?sort=-price,createdAt  →  { price: -1, createdAt: 1 }
  let sort = { createdAt: -1 };
  if (queryParams.sort) {
    sort = {};
    queryParams.sort.split(',').forEach((field) => {
      const dir = field.startsWith('-') ? -1 : 1;
      sort[field.replace(/^-/, '')] = dir;
    });
  }

  // Field selection: e.g. ?fields=title,price
  let select = projection;
  if (queryParams.fields && !projection) {
    select = queryParams.fields.split(',').join(' ');
  }

  let query = Model.find(filter).sort(sort).skip(skip).limit(limit);
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);

  const [docs, total] = await Promise.all([query, Model.countDocuments(filter)]);

  return {
    docs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = paginate;
