import type { NextApiRequest, NextApiResponse } from 'next';

import getFilteredContent from '@/lib/services/content-filter.service';
import { FACET_QUERY_MAP } from '@/constants/search.constants';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const filters = {};
  for (const fk in FACET_QUERY_MAP) {
    if (req?.query[FACET_QUERY_MAP[fk].inputName]) {
      filters[FACET_QUERY_MAP[fk].inputName] = typeof req.query[FACET_QUERY_MAP[fk].inputName] == 'string'
        ? [req.query[FACET_QUERY_MAP[fk].inputName]]
        : req.query[FACET_QUERY_MAP[fk].inputName];
    }
  }

  const filteredContent = await getFilteredContent({
    contentTypesFilter: typeof req.query.type == 'string' ? [req.query.type] : req.query.type,
    parentIds: typeof req.query.parent == 'string' ? [req.query.parent] : req.query.parent,
    filters
  });

  res.status(200).json(filteredContent);
};

export default handler;
