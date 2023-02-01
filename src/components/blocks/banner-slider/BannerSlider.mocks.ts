import { IPromoBlock } from "@/lib/interfaces/promo-content-cf.interface";

const data: IPromoBlock = {
  featuredContentsCollection: {
    items: [
      {
        promoTitle: '1. Avanzar es disfrutar el calor de hogar con nuevos gasodomésticos',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel: 'Ir a la tienda',
        internalLink: {
          urlPath:'#'
        }
      },
      {
        promoTitle: '2. Avanzar es aprovechar los precios que tendrás con Vanti Listo',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel:'Conocer Vanti Listo',
        internalLink: {
          urlPath:'#'
        }
      },
      {
        promoTitle: '3. Avanzar es instalar puntos de gas para tus gasodomésticos',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel:'Solicitar punto de gas',
        internalLink:{
          urlPath:'#'
        }
      },
      {
        promoTitle: '4. Avanzar es aprovechar los precios que tendrás con Vanti Listo',
        promoImage: {
          url: 'https://via.placeholder.com/1920x600',
        },
        ctaLabel:'Conocer Vanti Listo',
        internalLink:{
          urlPath: '#'
        }
      }
    ]
  }
};

export const mockBannerSliderProps = {
  data,
};