import { IPromoBlock } from "@/lib/interfaces/promo-content-cf.interface";

const data: IPromoBlock = {
  featuredContentsCollection: {
    items: [
      {
        promoTitle: 'Avanzar es disfrutar el calor de hogar con nuevos gasodomésticos',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel: 'Ir a la tienda',
        internalLink: {
          urlPaths:['#']
        }
      },
      {
        promoTitle: 'Avanzar es aprovechar los precios que tendrás con Vanti Listo',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel:'Conocer Vanti Listo',
        internalLink: {
          urlPaths:['#']
        }
      },
      {
        promoTitle: 'Avanzar es instalar puntos de gas para tus gasodomésticos',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel:'Solicitar punto de gas',
        internalLink:{
          urlPaths:['#']
        }
      },
      {
        promoTitle: 'Avanzar es aprovechar los precios que tendrás con Vanti Listo',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel:'Conocer Vanti Listo',
        internalLink:{
          urlPaths:[ '#']
        }
      }
    ]
  }
};

export const mockBannerSliderProps = {
  data,
};