import { IPromoBlock } from "./promo-content-cf.interface";
import { ISEOTags } from "./seo-tags-cf.interface";

export interface IPage {
    name: string;
    content: string;
    block: IPromoBlock;
    promoTitle?: string;
    seo?: ISEOTags;

}