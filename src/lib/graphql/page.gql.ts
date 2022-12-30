import { AssetImageQuery } from "./shared/asset.gql";
import DefaultQuery from "./shared/default.gql";
import RichtextQuery from "./shared/richtext.qql";

const PageQuery = `
  ${DefaultQuery}
  name
  slug
  content {
    ${RichtextQuery}
  }
  blocksCollection {
    items {
      ...on BlockPromoContent {
        ${DefaultQuery}
      }
    }
  }
  promoTitle
  promoImage {
    ${AssetImageQuery}
  }
  promoDescription {
    ${RichtextQuery}
  }
  promoIcon
  mainNavCollection {
    items {
      ...on Page {
        ${DefaultQuery}
      }
      ...on AuxNavigation {
        ${DefaultQuery}
      }
      ...on AuxCustomContent {
        ${DefaultQuery}
      }
    }
  }
`;

export default PageQuery;
