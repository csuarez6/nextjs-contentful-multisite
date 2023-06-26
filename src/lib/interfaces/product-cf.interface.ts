import { ISelect } from '@/components/atoms/select-atom/SelectAtom';
import { ICarousel } from '@/components/organisms/carousel/Carousel';
import { IImageAsset } from './assets-cf.interface';
import { ILink } from './menu-cf.interface';
import { IPromoBlock } from './promo-content-cf.interface';
import { IRichText } from './richtext-cf.interface';
import { apiResponse } from './api-response.interface';

export enum PaymentMethodType {
  pse = 'pse',
  vantilisto = 'vantilisto',
  factura = 'factura'
}

export interface IPaymentMethod {
  name: string;
  type: PaymentMethodType;
  helpText?: string;
}

/**
 * @deprecated Interfaz obsoleta
 */
export interface IProductDetails {
  productName?: string;
  priceGasodomestico?: string;
  priceBeforeGasodomestico?: string;
  priceVantiListo?: string;
  priceBeforeVantiListo?: string;
  productsQuantityGasodomestico?: string;
  productsQuantityVantiListo?: string;
  description?: string;
  images?: IImageAsset[];
  details?: string[];
  paymentMethods?: IPaymentMethod[];
  onBuy?: (type: PaymentMethodType, skuCode: string) => void
  features?: IRichText;
  cta?: ILink;
  isNew?: boolean;
  discount?: string;
  referenceCode?: number;
  carouselData?: ICarousel;
  dataSelect?: ISelect[];
  rating?: number;
}

export interface IProductFilterBlock {
  principalSearch?: boolean;
  products?: IPromoBlock;
  facets?: ISelect[];
  onFacetsChange?: (newQueryString: string) => void;
  type?: string;
  types?: any;
};

export interface IProductOverviewDetails {
  __typename?: string;
  name?: string;
  promoTitle?: string;
  urlPaths?: [string];
  priceGasodomestico?: string;
  _priceGasodomestico?: string;
  priceBeforeGasodomestico?: string;
  priceVantiListo?: string;
  priceBeforeVantiListo?: string;
  productsQuantityGasodomestico?: string;
  productsQuantityVantiListo?: string;
  promoDescription?: IRichText;
  productFeatures?: IRichText;
  paymentMethods?: IPaymentMethod[];
  onBuy?: (type: PaymentMethodType, skuCode: string, imageProduct: string, nameProduct: string) => void
  onBuyHandler?: (type: PaymentMethodType) => Promise<apiResponse>,
  onEventHandler?: (type: string, params?: object) => void,
  features?: IRichText;
  warranty?: {
    name?: string;
    description?: IRichText;
  };
  cta?: ILink;
  callbackURL?: string;
  sku?: string;
  marketId?: string;
  promoImage?: IImageAsset;
  imagesCollection?: {
    items?: IImageAsset[];
  };
  dataSelect?: ISelect[];
  rating?: number;
  footerText?: any;
  trademark?: {
    name?: string;
    image?: IImageAsset;
  };
  category?: {
    name?: string;
    image?: IImageAsset;
    clWarrantyReference?: string;
    clInstallationReference?: string;
  };
  relatedProducts?: IProductOverviewDetails[];
  isNew?: boolean;
  discount?: string;
  copyServices?: any;
}

export interface IAllyOverviewDetails {
  __typename?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  promoTitle?: string;
  promoDescription?: IRichText;
  promoImage?: IImageAsset;
  promoIcon?: string;
}