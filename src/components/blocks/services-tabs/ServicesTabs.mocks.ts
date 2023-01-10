import { RICHTEXT_SHORT_SIMPLE } from "@/constants/mocks.constants";
import { IPromoBlock } from "@/lib/interfaces/promo-content-cf.interface";

const data: IPromoBlock = {
  featuredContentsCollection: {
    items: [
      {
        name: "Solicitar punto de gas",
        promoTitle: "Solicitar nuevo punto de gas",
        promoDescription: RICHTEXT_SHORT_SIMPLE,
        promoImage: {
          title: "Solicitar nuevo punto de gas",
          description: "",
          contentType: "image/png",
          url: "https://images.ctfassets.net/3brzg7q3bvg1/7uBUtCEOdu46BS3lvSgJRm/53c1c715cc752ff79a4165b162080271/Solicitarpuntogas.png",
          width: 1952,
          height: 1600
        },
        promoIcon: "installation"
      },
      {
        name: "Adquirir gasodomésticos",
        promoTitle: "Adquirir gasodoméstico",
        promoDescription: RICHTEXT_SHORT_SIMPLE,
        promoImage: null,
        promoIcon: "expert",
      },
      {
        name: "Reparar e instalar",
        promoTitle: "Solicitar reparación e instalación",
        promoDescription: RICHTEXT_SHORT_SIMPLE,
        promoImage: {
          title: "Solicitar nuevo punto de gas",
          description: "",
          contentType: "image/png",
          url: "https://images.ctfassets.net/3brzg7q3bvg1/7uBUtCEOdu46BS3lvSgJRm/53c1c715cc752ff79a4165b162080271/Solicitarpuntogas.png",
          width: 1952,
          height: 1600
        },
        promoIcon: "gas-services"
      },
      {
        name: "Financiar con Vanti Listo",
        promoTitle: "Financiar con Vanti Listo",
        promoDescription: RICHTEXT_SHORT_SIMPLE,
        promoImage: {
          title: "Solicitar nuevo punto de gas",
          description: "",
          contentType: "image/png",
          url: "https://images.ctfassets.net/3brzg7q3bvg1/7uBUtCEOdu46BS3lvSgJRm/53c1c715cc752ff79a4165b162080271/Solicitarpuntogas.png",
          width: 1952,
          height: 1600
        },
        promoIcon: "vantilisto",
      },
      {
        name: "Adquirir asistencias",
        internalLink: {
          slug: "/ad-asistencias"
        },
        externalLink: "https://www.google.com",
        ctaLabel: "Adquirir",
        promoTitle: "Adquirir asistencias",
        promoDescription: RICHTEXT_SHORT_SIMPLE,
        promoImage: null,
        promoIcon: "hands"
      }
    ]
  }
};

export const mockServicesTabsProps = {
  data,
};