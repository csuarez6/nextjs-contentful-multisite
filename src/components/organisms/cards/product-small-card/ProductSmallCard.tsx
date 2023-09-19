import Image from "next/image";
import CustomLink from "@/components/atoms/custom-link/CustomLink";
import { IPromoContent } from "@/lib/interfaces/promo-content-cf.interface";
import { classNames } from "@/utils/functions";

const ProductSmallCard: React.FC<IPromoContent> = (props) => {
  const { name, promoTitle, promoImage, ctaLabel, internalLink, externalLink } = props;
  const isPortrait = promoImage?.isPortrait;

  return (
    <CustomLink content={props} linkClassName="w-full min-h-[152px] h-full group" className="w-full h-full">
      <article
        className={classNames(
          "bg-neutral-90 shadow rounded-[18px] px-3 2md:px-7 relative flex overflow-hidden w-full h-full pb-6 pt-10 items-center",
          isPortrait && "md:flex-col-reverse md:items-start gap-6 md:pt-[70px] md:pb-0 md:min-h-[492px]"
        )}
      >
        {promoImage && (
          <div className={
            classNames(
              "h-full absolute top-0 right-0 w-1/2",
              isPortrait && "md:h-auto md:top-auto md:right-auto md:relative md:w-full"
            )}
          >
            <figure className={
              classNames(
                "w-full h-full relative",
                isPortrait && "md:aspect-[377/300] md:-ml-8 md:-mr-14 md:-mb-6 md:w-auto"
              )
            }>
              <Image
                src={promoImage.url}
                alt={promoImage.title}
                width={promoImage.width}
                height={promoImage.height}
                className="object-cover xs:object-contain 2lg:object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500"
              />
            </figure>
          </div>
        )}
        {(promoTitle || ctaLabel) && (
          <div className={
            classNames(
              "relative flex items-center w-full max-w-[55%]",
              isPortrait && "md:max-w-full"
            )}
          >
            <div className="grid space-y-[18px]">
              {promoTitle && <h3 className="text-blue-dark max-md:text-size-subtitle3">{promoTitle}</h3>}
              {(externalLink || internalLink?.urlPaths?.[0]) && (
                <div className="flex gap-3">
                  <div className="button button-primary cursor-pointer flex items-center">
                    {ctaLabel ?? name}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </CustomLink>
  );
};

export default ProductSmallCard;
