import DefaultQuery from "../shared/default.gql";
import RichtextQuery from "../shared/richtext.qql";

const BlockContentFilterQuery = `
  ${DefaultQuery}
  name
  title
  description {
    ${RichtextQuery}
  }
  parentsCollection {
    items {
      ...on Page {
        ${DefaultQuery}
      }
    }
  }
  contentTypesFilter
  availableFacets
  mainFacet
  orderingOptions
  pageResults
  blockId
  simpleView
`;

export default BlockContentFilterQuery;
