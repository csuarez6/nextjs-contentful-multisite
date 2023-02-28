import { gql } from '@apollo/client';
import _ from 'lodash';

import contentfulClient from './contentful-client.service';
import getReferencesContent from './references-content.service';

import CONTENTFUL_QUERY_MAPS from '@/constants/contentful-query-maps.constants';
import { CONTENTFUL_TYPENAMES } from '@/constants/contentful-typenames.constants';
import getFilteredContent from './content-filter.service';
import { getCommercelayerProduct } from './commerce-layer.service';

const REFERENCES = {
  [CONTENTFUL_TYPENAMES.PAGE]: [
    'blocksCollection',
    'mainNavCollection',
    'parent'
  ],
  [CONTENTFUL_TYPENAMES.PAGE_MINIMAL]: [
    'parent'
  ],
  [CONTENTFUL_TYPENAMES.AUX_NAVIGATION]: [
    'mainNavCollection',
    'secondaryNavCollection',
    'utilityNavCollection'
  ],
  [CONTENTFUL_TYPENAMES.BLOCK_PROMO_CONTENT]: [
    'ctaCollection',
    'featuredContentsCollection',
    'listedContentsCollection',
  ],
  [CONTENTFUL_TYPENAMES.AUX_CUSTOM_CONTENT]: [
    'mainNavCollection',
  ],
};

type DefaultBlockInfo = {
  __typename: string;
  sys: {
    id: string;
  }
};

export const MAX_DEPTH_RECURSION = 14;

const getEntryContent = async (blockInfo: DefaultBlockInfo, preview = false, recursive = true, actualDepth = 1) => {
  if (!blockInfo || !CONTENTFUL_QUERY_MAPS[blockInfo.__typename]) {
    console.error(`Error on getEntryContent: «blockInfo» are required or it's not defined`);
    return null;
  }

  let responseData = null;
  let responseError = null;

  if (!blockInfo?.sys?.id) {
    console.error(`Error on entry query, sys.id not defined => `, blockInfo);
    return null;
  }

  const { queryName: type, query } = CONTENTFUL_QUERY_MAPS[blockInfo.__typename];

  try {
    ({ data: responseData, error: responseError } = await contentfulClient(preview).query({
      query: gql`
        query getEntry($id: String!, $preview: Boolean!) {
          ${type}(id: $id, preview: $preview) {
            ${query}
          }
        }
      `,
      variables: {
        id: blockInfo.sys.id,
        preview
      },
      errorPolicy: 'all'
    }));
  } catch (e) {
    responseError = e;
    responseData = {};
  }

  if (responseError) {
    console.error(`Error on entry query (${type}) => `, responseError.message, blockInfo);
  }

  if (!responseData?.[type]) {
    return null;
  }

  const entryContent = JSON.parse(
    JSON.stringify(
      responseData?.[type]
    )
  );

  if (blockInfo.__typename == CONTENTFUL_TYPENAMES.PAGE_MINIMAL) {
    entryContent.__typename = CONTENTFUL_TYPENAMES.PAGE_MINIMAL;
  }

  if (
    REFERENCES[entryContent.__typename] &&
    REFERENCES[entryContent.__typename].length > 0 &&
    recursive && actualDepth < MAX_DEPTH_RECURSION
  ) {
    if (entryContent?.parent?.__typename) {
      entryContent.parent.__typename = CONTENTFUL_TYPENAMES.PAGE_MINIMAL;
    }

    const referencesContent = await getReferencesContent(
      entryContent,
      REFERENCES[entryContent.__typename],
      preview,
      recursive,
      actualDepth
    );

    _.merge(entryContent, referencesContent);
  }

  if (entryContent.__typename === CONTENTFUL_TYPENAMES.BLOCK_CONTENT_FILTER) {
    const preloadContent = await getFilteredContent({
      contentTypesFilter: entryContent.contentTypesFilter ?? [],
      parentIds: entryContent.parentsCollection?.items?.map((p) => p.sys.id) ?? [],
      availableFacets: entryContent.availableFacets ?? [],
    });

    _.merge(entryContent, { preloadContent });
  }

  if (entryContent.__typename === CONTENTFUL_TYPENAMES.PRODUCT && entryContent?.sku) {
    const commercelayerProduct = await getCommercelayerProduct(entryContent.sku);
    _.merge(entryContent, commercelayerProduct);
  }

  return entryContent;
};

export default getEntryContent;
