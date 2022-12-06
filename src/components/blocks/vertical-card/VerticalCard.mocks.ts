import { IPromoBlock } from "@/lib/interfaces/promo-content-cf.interface";

const data: IPromoBlock = {
  title: 'Título',
  description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do tempor incididunt ut labore et dolore magna aliqua.',
  content: {
    title: 'Título',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do tempor incididunt ut labore et dolore magna aliqua.',
    url: '#',
    image: {
      url: 'https://via.placeholder.com/588x180.png',
      title: 'Card image'
    }
  }
};

export const mockVerticalCardProps = {
  data,
};
