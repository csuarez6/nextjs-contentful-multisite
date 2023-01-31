import { IImageAsset } from './assets-cf.interface';
import { ILink, IListItems } from "@/lib/interfaces/menu-cf.interface";
import { IRpoForm } from "./IForm-cf";
import { IRichText } from './richtext-cf.interface';
import { IPage } from './page-cf.interface';
import { IProductOverviewDetails } from './product-cf.interface';
import { IProductCategory } from './content-filter-cf.interface';

interface IBlockProps {
    isFirst?: boolean;
    isLast?: boolean;
    key?: string;
    asBlock?: boolean;
    sysId?: string;
}

export interface IPromoContent {
    __typename?: string;
    sys?: {
        id?: string;
    };
    name?: string;
    promoTitle?: string;
    subtitle?: string;
    promoDescription?: IRichText;
    /**
     * @deprecated
     */
    cta?: ILink;
    promoImage?: IImageAsset;
    alt?: string;
    promoIcon?: string;
    iconPosition?: string;
    iconSize?: string;
    iconColor?: string;
    buttonType?: string;
    alignButton?: string;
    iconBackgroundColor?: string;
    bgIconRounded?: string;
    isReverse?: boolean;
    tags?: ITag[];
    externalLink?: string;
    internalLink?: IPage;
    linkParameters?: string;
    ctaLabel?: string;
    slug?: string;
    isActive?: boolean;
    children?: React.ReactNode;
}

export interface IPromoBlock extends IBlockProps {
    __typename?: string;
    title?: string;
    pretitle?: string;
    subtitle?: string;
    description?: IRichText;
    /**
     * @deprecated
     */
    content?: IPromoContent;
    listedContentsCollection?: {
        items?: IPromoContent[] | IProductOverviewDetails[]
    };
    featuredContentsCollection?: {
        items?: IPromoContent[] | IProductCategory[]
    };
    /**
     * @deprecated
     */
    backgroundColor?: string;
    /**
     * @deprecated
     */
    columnsSize?: number;
    /**
     * @deprecated
     */
    alignImage?: string;
    /**
     * @deprecated
     */
    iconColor?: string;
    /**
     * @deprecated
     */
    buttonColor?: string;
    view?: IView;
    /**
     * @deprecated
     */
    isReverse?: boolean;
    /**
     * @deprecated
     */
    cta?: IListItems;
    image?: IImageAsset;
    listedForm?: IRpoForm;
    /**
     * @deprecated
     */
    imageOrientation?: string;
    ctaCollection?: {
        items?: IPromoContent[]
    }
    blockId?: string;
    links?: ILink[]
}

export interface ITag {
    label: string;
    backgroundColor?: string;
}

export interface IView {
    name?: string;
    backgroundColor?: string;
    bannerHeight?: string;
    bannerWidth?: string;
    buttonType?: string;
    columnsSize?: number;
    imageAlign?: string;
    iconBackgroundColor?: string;
    iconPosition?: string;
    iconSize?: string;
    displayIcon?: boolean;
    imageOrientation?: string;
    isReverse?: boolean;
    alignTitle?: string;
    isSlider?: boolean;
    alignButton?: string;
}