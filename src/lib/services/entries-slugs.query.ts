import { gql } from '@apollo/client';
import contentfulClient from './contentful-client.service';

const getEntriesSlugs = async ({ limit = 100 }, preview = false) => {
  let responseData = null;
  let responseError = null;

  try {
    ({ data: responseData, error: responseError } = await contentfulClient(preview).query({
      query: gql`
        query getEntriesSlugs($limit: Int!, $preview: Boolean!) {
          pageCollection(where: { AND: { urlPath_exists: true, contentfulMetadata: { tags: { id_contains_none: ["testPage"] } } } },order: urlPath_ASC, limit: 1000, preview: false) {
            items {
              sys {
                id
                publishedAt
              }
              urlPath
            }
          }
          productCollection(where: { urlPath_exists: true },order: urlPath_ASC, limit: $limit, preview: $preview) {
            items {
              sys {
                id
                publishedAt
              }
              urlPath
            }
          }
        }
      `,
      variables: {
        limit,
        preview
      },
      errorPolicy: 'all'
    }));
  } catch (e) {
    responseError = e;
    responseData = {};
  }

  if (responseError) {
    console.error('Error on entry-slug query => ', responseError.message);
  }

  const resultEntries = responseData?.pageCollection?.items ?? [];
  if (responseData?.productCollection?.items) {
    resultEntries.push(...responseData.productCollection.items);
  }

  return resultEntries;
};

export default getEntriesSlugs;
