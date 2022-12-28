import { RICHTEXT_SHORT_SIMPLE } from "@/constants/mocks.constants";
import { IPromoContent } from "@/lib/interfaces/promo-content-cf.interface";

const data: IPromoContent = {
  promoTitle: 'Título',
  promoDescription: RICHTEXT_SHORT_SIMPLE,
  cta: {
    href: '#',
    name: 'conocelós'
  }
};

export const mockInformativeGridCardProps = {
  data,
};
