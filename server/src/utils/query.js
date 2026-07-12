export async function getPaginatedAndSorted({
  model,
  req,
  where = {},
  include = undefined,
  defaultSort = { createdAt: 'desc' },
  mapFn = null,
}) {
  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const sortBy = req.query.sortBy;
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  let orderBy = defaultSort;
  if (sortBy) {
    if (sortBy.includes('.')) {
      const parts = sortBy.split('.');
      orderBy = {};
      let current = orderBy;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = sortOrder;
    } else {
      orderBy = { [sortBy]: sortOrder };
    }
  }

  let results;
  let totalCount = 0;
  let totalPages = 1;

  if (page !== null && !isNaN(page)) {
    const skip = (page - 1) * limit;
    totalCount = await model.count({ where });
    totalPages = Math.ceil(totalCount / limit);
    results = await model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    });
  } else {
    results = await model.findMany({
      where,
      include,
      orderBy,
    });
  }

  if (mapFn) {
    results = results.map(mapFn);
  }

  if (page !== null && !isNaN(page)) {
    return {
      items: results,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
      },
    };
  }

  return results;
}
