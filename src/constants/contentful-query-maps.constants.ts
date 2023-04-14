import { CONTENTFUL_TYPENAMES } from "./contentful-typenames.constants";

import PageQuery, { PageMinimalQuery } from "@/lib/graphql/page.gql";
import BlockPromoContentQuery from "@/lib/graphql/blocks/promo-content.gql";
import AuxNavigationQuery from "@/lib/graphql/aux/navigation.gql";
import AuxCustomContent, { AuxCustomContentMinimalQuery } from "@/lib/graphql/aux/custom-content.gql";
import ProductQuery, { ProductMinimalQuery } from '../lib/graphql/product.gql';
import BlockContentFilterQuery from "@/lib/graphql/blocks/content-filter.gql";
import ProductCategoryQuery from "@/lib/graphql/shared/product-category.gql";
import TrademarkQuery from "@/lib/graphql/shared/trademark.gql";
import { BlockFormQuery } from "@/lib/graphql/blocks/form-content.gql";
import RateQuery from "@/lib/graphql/rate.gql";
import AllyQuery from "@/lib/graphql/ally.gql";

const CONTENTFUL_QUERY_MAPS = {
  [CONTENTFUL_TYPENAMES.PAGE]: {
    queryName: 'page',
    query: PageQuery,
  },
  [CONTENTFUL_TYPENAMES.PAGE_MINIMAL]: {
    queryName: 'page',
    query: PageMinimalQuery,
  },
  [CONTENTFUL_TYPENAMES.PRODUCT]: {
    queryName: 'product',
    query: ProductQuery,
  },
  [CONTENTFUL_TYPENAMES.PRODUCT_MINIMAL]: {
    queryName: 'product',
    query: ProductMinimalQuery,
  },
  [CONTENTFUL_TYPENAMES.BLOCK_PROMO_CONTENT]: {
    queryName: 'blockPromoContent',
    query: BlockPromoContentQuery,
  },
  [CONTENTFUL_TYPENAMES.BLOCK_FORM]: {
    queryName: 'blockForm',
    query: BlockFormQuery,
  },
  [CONTENTFUL_TYPENAMES.BLOCK_CONTENT_FILTER]: {
    queryName: 'blockContentFilter',
    query: BlockContentFilterQuery,
  },
  [CONTENTFUL_TYPENAMES.AUX_NAVIGATION]: {
    queryName: 'auxNavigation',
    query: AuxNavigationQuery,
  },
  [CONTENTFUL_TYPENAMES.AUX_CUSTOM_CONTENT]: {
    queryName: 'auxCustomContent',
    query: AuxCustomContent,
  },
  [CONTENTFUL_TYPENAMES.AUX_CUSTOM_CONTENT_MINIMAL]: {
    queryName: 'auxCustomContent',
    query: AuxCustomContentMinimalQuery,
  },
  [CONTENTFUL_TYPENAMES.PRODUCT_CATEGORY]: {
    queryName: 'productCategory',
    query: ProductCategoryQuery,
  },
  [CONTENTFUL_TYPENAMES.TRADEMARK]: {
    queryName: 'trademark',
    query: TrademarkQuery,
  },
  [CONTENTFUL_TYPENAMES.AUX_RATE]: {
    queryName: 'auxRate',
    algoliaType: 'aux_Rate',
    query: RateQuery,
  },
  [CONTENTFUL_TYPENAMES.AUX_ALLY]: {
    queryName: 'auxAlly',
    algoliaType: 'aux_Ally',
    query: AllyQuery,
  },
};

export default CONTENTFUL_QUERY_MAPS;
