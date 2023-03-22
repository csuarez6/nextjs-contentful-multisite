import { gql } from "@apollo/client";
import _ from "lodash";
import algoliasearch, { SearchIndex } from "algoliasearch";

import contentfulClient from "./contentful-client.service";

import CONTENTFUL_QUERY_MAPS from "@/constants/contentful-query-maps.constants";
import { FACET_QUERY_MAP } from "@/constants/search.constants";

export const getAlgoliaSearchIndex = (appId, appKey): SearchIndex => {
  const searchClient = algoliasearch(appId, appKey);
  const searchIndex = searchClient.initIndex("Production");

  return searchIndex;
};

const applyFilterModifier = (filterKey, filterValue, modifier) => {
  let filterValueModified = `${filterKey}:${filterValue}`;

  if (modifier === "stringify") {
    filterValueModified = `${filterKey}:"${filterValue}"`;
  }

  if (modifier === "range") {
    const [min, max] = filterValue.split("-");
    filterValueModified = max
      ? min
        ? `${filterKey}:${min} TO ${max}`
        : `${filterKey} <= ${max}`
      : min
      ? `${filterKey} >= ${min}`
      : "";
  }

  return filterValueModified;
};

const getAlgoliaResults = async ({
  contentTypesFilter,
  parentIds = [],
  availableFacets = [],
  pageResults = 9,
  filters = {},
  page = 1,
}) => {
  const resultObject: {
    items: any[];
    totalItems: number;
    totalPages: number;
    actualPage: number;
    facets: any;
  } = {
    items: [],
    totalItems: 0,
    totalPages: 0,
    actualPage: 0,
    facets: {},
  };

  const types = [];
  const algoliaFilter = [];
  const algoliaFacets = Object.keys(FACET_QUERY_MAP).filter(
    (fk) => availableFacets.indexOf(FACET_QUERY_MAP[fk].title) >= 0
  );

  for (const contentTypeFilter of contentTypesFilter) {
    const { queryName: type } = CONTENTFUL_QUERY_MAPS[
      _.upperFirst(contentTypeFilter)
    ] ?? { queryName: null };
    if (type) types.push(type);
  }

  const contentTypeFilterSearchQuery = types.map(
    (ct) => `sys.contentType.sys.id:${ct}`
  );
  algoliaFilter.push(
    `(${contentTypeFilterSearchQuery.join(" OR ")})`
  );
  
  if (parentIds?.length) {
    const parentIdsSearchQuery = parentIds?.map(
      (pid) => `fields.parent.sys.id:${pid}`
    );
    algoliaFilter.push(
      `(${parentIdsSearchQuery.join(" OR ")})`
    );
  }
  for (const filterName in filters) {
    const filterDef = Object.keys(FACET_QUERY_MAP).find(
      (fk) => filterName === FACET_QUERY_MAP[fk].inputName
    );

    if (filterDef) {
      let filterValue = `${filterDef}:${filters[filterName]}`;
      const modifier = FACET_QUERY_MAP[filterDef].modifier;

      if (modifier) {
        filterValue = applyFilterModifier(
          filterDef,
          filters[filterName],
          modifier
        );
      }

      algoliaFilter.push(filterValue);
    }
  }

  const indexSearch = getAlgoliaSearchIndex(
    process.env.ALGOLIASEARCH_APP_ID,
    process.env.ALGOLIASEARCH_READ_API_KEY
  );
  const resultAlgolia = await indexSearch.search("", {
    filters: algoliaFilter.join(" AND "),
    facets: algoliaFacets,
    hitsPerPage: pageResults,
    attributesToRetrieve: ["fields"],
    page: --page,
  });

  ({
    hits: resultObject.items,
    nbHits: resultObject.totalItems,
    nbPages: resultObject.totalPages,
    page: resultObject.actualPage,
    facets: resultObject.facets,
  } = resultAlgolia);

  return resultObject;
};

const getFacetsValues = async (facets: any): Promise<Array<any>> => {
  const facetsWithValues = [];
  const preview = false;

  for (const facetId in facets) {
    const facetContentNames = Object.keys(facets[facetId]);

    if (FACET_QUERY_MAP[facetId]) {
      const { queryName, query } = FACET_QUERY_MAP[facetId];

      if (query) {
        try {
          const { data: responseData } = await contentfulClient(preview).query({
            query: gql`
            query getEntriesCollection($preview: Boolean!, $limit: Int!) {
              ${queryName}Collection(where: { name_in: ["${facetContentNames.join(
              '", "'
            )}"] }, preview: $preview, limit: $limit) {
                items {
                  ${query}
                }
              }
            }
          `,
            variables: {
              preview,
              limit: facetContentNames.length,
            },
            errorPolicy: "all",
          });

          if (responseData?.[`${queryName}Collection`]?.items) {
            const facetContents = {
              name: FACET_QUERY_MAP[facetId].inputName,
              labelSelect: FACET_QUERY_MAP[facetId].title,
              placeholder: `Seleccionar ${FACET_QUERY_MAP[facetId].title}`,
              listedContents:
                FACET_QUERY_MAP[facetId].rawOptions ??
                responseData[`${queryName}Collection`].items.map(
                  (facetContent: any) => {
                    return {
                      ...facetContent,
                      text: facetContent.promoTitle ?? facetContent.name,
                      value: facetContent.name,
                      totalItems: facets[facetId][facetContent.name],
                    };
                  }
                ),
            };

            facetContents.listedContents.unshift({
              sys: {
                id: `${facetContents.name}_all-items`,
              },
              name: `Todo`,
              text: `Todo`,
              value: "*",
              totalItems: 0,
              image: {
                url: `/images/show-all-${facetContents.name}.png`,
              },
            });
            facetsWithValues.push(facetContents);
          }
        } catch (e) {
          console.error(`Error on getFacetsValues => `, e.message);
        }
      } else {
        const facetContents = {
          name: FACET_QUERY_MAP[facetId].inputName,
          labelSelect: FACET_QUERY_MAP[facetId].title,
          placeholder: `Seleccionar ${FACET_QUERY_MAP[facetId].title}`,
          listedContents:
            FACET_QUERY_MAP[facetId].rawOptions ??
            facetContentNames.map((facetValue: any) => {
              return {
                name: "",
                text: facetValue,
                value: facetValue,
                image: null,
                totalItems: facets[facetId][facetValue],
              };
            }),
        };

        facetContents.listedContents.unshift({
          name: "",
          text: `Todo`,
          image: null,
          value: "*",
          totalItems: 0,
        });
        facetsWithValues.push(facetContents);
      }
    }
  }

  return facetsWithValues;
};

const getFilteredContent = async ({
  contentTypesFilter,
  parentIds = [],
  availableFacets = [],
  pageResults = 9,
  filters = {},
  page = 1,
}) => {
  if (!contentTypesFilter) {
    console.error(
      `Error on getFilteredContent: «contentTypesFilter» are required or it's not defined`
    );
    return null;
  }

  const filteredContentResults = await getAlgoliaResults({
    contentTypesFilter,
    parentIds,
    availableFacets,
    pageResults,
    filters,
    page,
  });

  if (!filteredContentResults?.items?.length) {
    return null;
  }

  filteredContentResults.items = filteredContentResults.items.map(
    (item) => item.fields
  );

  if (
    filteredContentResults?.facets &&
    Object.keys(filteredContentResults?.facets).length > 0
  ) {
    filteredContentResults.facets = await getFacetsValues(
      filteredContentResults.facets
    );
  }else{
   filteredContentResults.facets = []; 
  }

  return filteredContentResults;
};

export default getFilteredContent;
