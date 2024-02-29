import {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import CheckoutContext from "@/context/Checkout";
import { useLastPath } from "@/hooks/utils/useLastPath";
import {
  COOKIES_ID,
  DEFAULT_FOOTER_ID,
  DEFAULT_HEADER_ID,
  DEFAULT_HELP_BUTTON_ID,
  DEFAULT_WARRANTY_COPY,
  TERMS_OF_SERVICE_ID,
} from "@/constants/contentful-ids.constants";
import { getHeader, getNavigation } from "@/lib/services/menu-content.service";
import CheckoutLayout from "@/components/templates/checkout/Layout";
import HeadingCard from "@/components/organisms/cards/heading-card/HeadingCard";
import CustomLink from "@/components/atoms/custom-link/CustomLink";
import { defaultLayout } from "../../../../_app";
import {
  ADD_CART_422_ERROR_MSG,
  ADD_CART_GENERAL_ERROR_MSG,
  NEXT_STEP_ERROR_MSG,
  PSE_STEPS_TO_VERIFY,
  REMOVE_CART_GENERAL_ERROR_MSG,
  VantiOrderMetadata,
} from "@/constants/checkout.constants";
import AuthContext from "@/context/Auth";
import InformationModal from "@/components/organisms/Information-modal/InformationModal";
import { classNames, formatPrice, showProductTotal } from "@/utils/functions";
import {
  ModalIntall,
  ModalWarranty,
} from "@/components/blocks/product-details/ProductConfig";
import { IPromoContent } from "@/lib/interfaces/promo-content-cf.interface";
import ModalSuccess from "@/components/organisms/modal-success/ModalSuccess";
import { IAdjustments } from "@/lib/services/commerce-layer.service";
import Link from "next/link";
import { CONTENTFUL_TYPENAMES } from "@/constants/contentful-typenames.constants";
import { getDataContent } from "@/lib/services/richtext-references.service";
import { IPage } from "@/lib/interfaces/page-cf.interface";
import { IProductOverviewDetails } from "@/lib/interfaces/product-cf.interface";
import Spinner from "@/components/atoms/spinner/Spinner";
import { gaEventBeginCheckout } from "@/utils/ga-events--checkout";

const CheckoutVerify = (props: IPage & IProductOverviewDetails) => {
  const { copyServices } = props;
  const router = useRouter();
  const lastPath = useLastPath();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    icon: "",
    type: "",
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isActivedModal, setIsActivedModal] = useState(false);
  const [paramModal, setParamModal] = useState<IPromoContent>();
  const [modalChild, setmodalChild] = useState<any>();
  const defaultInstallList = {
    id: "defInstall1",
    name: "Sin servicio de instalación",
    formatted_price_amount: "$0",
  };
  const defaultWarrantyList = {
    id: "defWarranty1",
    name: "Sin garantía extendida",
    formatted_price_amount: "$0",
  };
  const [skuOptionsGlobal, setSkuOptionsGlobal] = useState<any>([]);
  const productSelected = useRef(null);
  const fechRequestStatus = useRef(false);
  const [showWarranty, setShowWarranty] = useState<boolean>(true);
  const [showInstallation, setShowInstallation] = useState<boolean>(true);

  const { isLogged, user } = useContext(AuthContext);
  const {
    order,
    flow,
    updateMetadata,
    updateItemQuantity,
    addLoggedCustomer,
    getSkuList,
    changeItemService,
    isFetchingOrder,
  } = useContext(CheckoutContext);

  const products = useMemo(() => {
    setIsLoading(false);
    if (!order?.line_items) return [];
    return order.line_items;
  }, [order]);

  const servicesHandler = async (type: string, params) => {
    const productItem = productSelected.current;
    const itemService = order.line_items
      .filter((item) => item.id === productItem)
      .map((item) => {
        return item;
      });
    const dataAdjustment: IAdjustments = {
      name: params.name + " - " + itemService?.[0]?.["sku_code"],
      amount_cents:
        type === "warranty"
          ? (
              (Number(params["price_amount_float"]) *
                Number(itemService[0]["unit_amount_float"])) /
              100
            ).toString()
          : params["price_amount_float"],
      type: type === "warranty" ? "warranty" : "installation",
      sku_id: itemService?.[0]?.["id"],
      sku_code: itemService?.[0]?.["sku_code"],
      sku_name: itemService?.[0]?.["name"],
      sku_option_id: params.id,
      sku_option_name: params.name,
      categoryReference: params.reference,
    };
    if (fechRequestStatus.current) return;
    fechRequestStatus.current = true;
    if (type === "warranty")
      await changeItemService(
        itemService?.[0]?.["warranty_service"]?.[0]?.["id"],
        dataAdjustment,
        itemService?.[0]?.["quantity"],
        productItem
      );
    if (type === "installation")
      await changeItemService(
        itemService?.[0]?.["installlation_service"]?.[0]?.["id"],
        dataAdjustment,
        itemService?.[0]?.["quantity"],
        productItem
      );
    setTimeout(() => {
      fechRequestStatus.current = false;
    }, 1000);
    setIsActivedModal(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const warrantyIsActived = !!(copyServices.find(i => i.key === 'show.warranty')?.active);
        const installationIsActived = !!(copyServices.find(i => i.key === 'show.installation')?.active);

        if(warrantyIsActived || installationIsActived){
          const infoSkus = await getSkuList();
          if (infoSkus?.data) setSkuOptionsGlobal(infoSkus.data);
        }

        setShowWarranty(warrantyIsActived);
        setShowInstallation(installationIsActived);

      } catch (error) {
        console.error("Error at: ProductService", error);
      }
    })();    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCompleted = useMemo(
    () =>
      order &&
      PSE_STEPS_TO_VERIFY.map((step) => !!order.metadata?.[step]).every(
        (i) => i
      ),
    [order]
  );

  const PATH_BASE = useMemo(
    () => `/tienda-virtual/checkout/${router.query.paymentType}`,
    [router.query]
  );

  const openModal = (
    category?: string,
    type?: string,
    idService?: string,
    idProduct?: string,
    productCategory?: string
  ) => {
    productSelected.current = idProduct;
    const productPriceItem = order?.line_items.find(
      (i) => i.id === idProduct
    )?.unit_amount_float;
    const compareCategory = category ?? productCategory;
    const skusOptions = skuOptionsGlobal.filter(
      (item) => item.reference === compareCategory
    );
    const posSkuIdService = skusOptions.findIndex((x) => x.id === idService);
    setParamModal({
      promoTitle:
        type === "installlation_service"
          ? "Instala tu gasodoméstico"
          : "Servicio Garantía",
    });
    if (type === "installlation_service") {
      setmodalChild(
        <ModalIntall
          optionsList={[defaultInstallList, ...skusOptions]}
          onEventHandler={servicesHandler}
          installCurrent={posSkuIdService + 1}
        />
      );
    } else {
      setmodalChild(
        <ModalWarranty
          optionsList={[defaultWarrantyList, ...skusOptions]}
          onEventHandler={servicesHandler}
          installCurrent={posSkuIdService + 1}
          productPrice={productPriceItem}
        />
      );
    }
    setIsActivedModal(false);
    setTimeout(() => {
      setIsActivedModal(true);
    }, 200);
  };

  const handleNext = async () => {
    setIsLoading(true);
    gaEventBeginCheckout(order);

    try {
      if (!products.length) {
        setError(true);
        setErrorMessage({
          icon: "alert",
          type: "warning",
          title: "Carrito vacío",
          description: "Tu carrito de compras está vacío en este momento. ¡Descubre nuestro amplio catálogo de productos en la tienda virtual y encuentra algo que te encante!",
        });
        return;
      }

      const meta = {
        [VantiOrderMetadata.IsVerified]: true,
      };

      if (isLogged) {
        await addLoggedCustomer();
        meta[VantiOrderMetadata.HasPersonalInfo] = true;
        meta["name"] = user.metadata?.name;
        meta["lastName"] = user.metadata?.lastName;
        meta["cellPhone"] = user.metadata?.cellPhone;
        meta["documentType"] = user.metadata?.documentType;
        meta["documentNumber"] = user.metadata?.documentNumber;
      }

      await updateMetadata(meta);

      router.push(`${PATH_BASE}/${flow.getNextStep(lastPath)}`);
    } catch (error) {
      console.error(error);
      setError(true);
      setErrorMessage({
        icon: "alert",
        type: "warning",
        title: "¡Ups!",
        description: NEXT_STEP_ERROR_MSG
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dropServices = (product) => {
    if (product) {
      if (!showWarranty && product["warranty_service"]?.length > 0) {
        productSelected.current = product.id;
        servicesHandler("warranty", [defaultWarrantyList][0]);
      }
      if (!showInstallation && product["installlation_service"]?.length > 0) {
        productSelected.current = product.id;
        servicesHandler("installation", [defaultInstallList][0]);
      }
    }
  };

  const increDecreQuantity = (product, operator) => {
    const quantityTemp =
      operator == "plus" ? product?.quantity + 1 : product?.quantity - 1;
    setIsLoading(true);
    updateItemQuantity(product?.sku_code, quantityTemp)
      .then((result) => {
        if (result.status !== 200) {
          const messageMinus = REMOVE_CART_GENERAL_ERROR_MSG;
          const messagePlus = result.status === 422 ? ADD_CART_422_ERROR_MSG : ADD_CART_GENERAL_ERROR_MSG;
          setError(true);
          setErrorMessage({
            icon: "alert",
            type: "warning",
            title: "¡Ups!",
            description: operator == "plus" ? messagePlus : messageMinus,
          });
        }
      })
      .catch((err) => console.error({ err }))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const onRouteChangeStart = () => setIsLoading(true);
    const routeChangeComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", onRouteChangeStart);
    router.events.on("routeChangeComplete", routeChangeComplete);

    return () => {
      router.events.off("routeChangeStart", onRouteChangeStart);
      router.events.off("routeChangeComplete", routeChangeComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  return (
    <HeadingCard
      classes="col-span-2"
      title="1. Verificar tu compra"
      icon="verify-purchase"
      isCheck={isCompleted}
    >
      <div className="flex flex-col sm:-mx-6 md:mx-0">
        {/* Start Heading */}
        <div className="grid font-bold border-b grid-template-product text-blue-dark border-grey-60 text-md">
          <div className="text-left py-3.5 pl-4 sm:pl-6 md:pl-0">
            <span>Productos</span>
          </div>
          <div className="hidden sm:inline-block py-3.5 px-3 text-center">
            <span>Cantidad</span>
          </div>
          <div className="hidden sm:inline-block py-3.5 text-right pr-1">
            <span>Precio</span>
          </div>
        </div>
        {/* End Heading */}

        {products.map((product: any) => {
          return (
            <div
              className="flex flex-wrap border-b sm:grid grid-template-product-details"
              key={`cart-product-${product.id}`}
            >
              <div className="row-start-1 row-end-5 py-3.5">
                <figure className="relative w-16 shrink-0">
                  {product?.image_url && (
                    <Image
                      className="w-full h-full"
                      src={product?.image_url}
                      alt={product?.name}
                      width={64}
                      height={64}
                      priority
                    />
                  )}
                </figure>
              </div>
              <div className="w-[calc(100%_-_70px)] flex-grow sm:w-auto text-left py-3.5 pl-4 text-grey-30 text-md font-bold">
                <Link
                  href={`/api/showproduct/${encodeURIComponent(
                    product?.sku_code ?? ""
                  )}`}
                >
                  {product?.name}
                </Link>
                <p className="text-xs text-left text-grey-60">* IVA incluido</p>
              </div>
              <div className="inline-block py-3.5 pb-0 sm:px-3 text-blue-dark sm:mx-auto">
                <div className="w-32 custom-number-input h-9">
                  <div className="relative flex flex-row w-full h-full bg-transparent rounded-lg">
                    <button
                      data-action="decrement"
                      className="w-20 h-full border border-r-0 outline-none cursor-pointer rounded-l-3xl"
                      disabled={product?.quantity == 1}
                      onClick={() => {
                        increDecreQuantity(product, "minus");
                      }}
                    >
                      <span
                        className={classNames(
                          "m-auto",
                          product?.quantity == 1 ? "opacity-25" : ""
                        )}
                      >
                        −
                      </span>
                    </button>
                    <input
                      type="text"
                      className="flex items-center w-full text-center outline-none border-y focus:outline-none text-md md:text-basecursor-default"
                      name="custom-input-number"
                      value={product?.quantity}
                      readOnly
                    ></input>
                    <button
                      data-action="increment"
                      className="w-20 h-full border border-l-0 cursor-pointer rounded-r-3xl"
                      onClick={() => {
                        increDecreQuantity(product, "plus");
                      }}
                    >
                      <span className="m-auto">+</span>
                    </button>
                  </div>
                </div>
                <button
                  className="text-xs text-blue-500 hover:text-blue-800"
                  onClick={() => {
                    setIsLoading(true);
                    updateItemQuantity(product?.sku_code, 0)
                      .then((result) => {
                        if (result.status !== 200) {
                          setError(true);
                          setErrorMessage({
                            icon: "alert",
                            type: "warning",
                            title: "¡Ups!",
                            description: REMOVE_CART_GENERAL_ERROR_MSG,
                          });
                        }
                      })
                      .finally(() => setIsLoading(false));
                  }}
                >
                  Eliminar
                </button>
              </div>
              <div className="inline-block py-3.5 text-right ml-auto font-bold sm:m-0 text-blue-dark text-md pr-1">
                {product.formatted_unit_amount.split(",")[0]}
              </div>
              {/* ********* Services ******** */}
              <div className="w-full mt-3 sm:hidden"></div>
              {showWarranty ? (
                <>
                  <div className="flex flex-col items-start py-1 text-sm text-left sm:block sm:pl-4 text-grey-30">
                    Garantía extendida{" "}
                    {product["warranty_service"]?.length > 0 && (
                      <>
                        <br />
                        <b>{product["warranty_service"][0]["name"]}</b>
                      </>
                    )}
                    <button
                      className="ml-2 text-xs text-blue-500 hover:text-blue-800"
                      onClick={() =>
                        openModal(
                          product["warranty_service"]?.[0]?.["item"]?.[
                            "metadata"
                          ]?.["categoryReference"] ??
                            product["clWarrantyReference"],
                          "warranty_service",
                          product["warranty_service"]?.[0]?.["item"]?.[
                            "metadata"
                          ]?.["sku_option_id"],
                          product.id,
                          product.metadata.clWarrantyReference
                        )
                      }
                    >
                      {product["warranty_service"]?.length > 0
                        ? "Cambiar"
                        : "Agregar"}
                    </button>
                  </div>
                  <div className="px-3 text-right">
                    <span className="inline-block p-1 mx-auto rounded-lg bg-blue-50 text-size-span">
                      {product["warranty_service"]?.length > 0
                        ? product["warranty_service"][0]["quantity"]
                        : "0"}
                      x
                    </span>
                  </div>
                  <div className="flex-grow inline-block py-1 pr-1 text-sm text-right text-blue-dark">
                    {product["warranty_service"]?.length > 0
                      ? product["warranty_service"][0][
                          "formatted_unit_amount"
                        ].split(",")[0]
                      : "$0"}
                  </div>
                </>
              ) : (
                <>{dropServices(product)}</>
              )}
              <div className="w-full sm:hidden"></div>
              {showInstallation ? (
                <>
                  <div className="flex flex-col items-start py-1 text-sm text-left sm:block sm:pl-4 text-grey-30">
                    Servicio de instalación{" "}
                    {product["installlation_service"]?.length > 0 && (
                      <>
                        <br />
                        <b>{product["installlation_service"][0]["name"]}</b>
                      </>
                    )}
                    <button
                      className="ml-2 text-xs text-blue-500 hover:text-blue-800"
                      onClick={() =>
                        openModal(
                          product["installlation_service"]?.[0]?.["item"]?.[
                            "metadata"
                          ]?.["categoryReference"] ??
                            product["clInstallationReference"],
                          "installlation_service",
                          product["installlation_service"]?.[0]?.["item"]?.[
                            "metadata"
                          ]?.["sku_option_id"],
                          product.id,
                          product.metadata.clInstallationReference
                        )
                      }
                    >
                      {product["installlation_service"]?.length > 0
                        ? "Cambiar"
                        : "Agregar"}
                    </button>
                  </div>
                  <div className="px-3 text-right">
                    <span className="inline-block p-1 mx-auto rounded-lg bg-blue-50 text-size-span">
                      {product["installlation_service"]?.length > 0
                        ? product["installlation_service"][0]["quantity"]
                        : "0"}
                      x
                    </span>
                  </div>
                  <div className="flex-grow inline-block py-1 pr-1 text-sm text-right ms:flex-grow-0 text-blue-dark">
                    {product["installlation_service"]?.length > 0
                      ? product["installlation_service"][0][
                          "formatted_unit_amount"
                        ].split(",")[0]
                      : "$0"}
                  </div>
                </>
              ) : (
                <>{dropServices(product)}</>
              )}
              {/* ********* End Services ******** */}
              <div className="w-full col-start-1 col-end-3 mt-3 sm:w-auto bg-blue-50"></div>
              <div className="inline-block py-1 mt-3 font-bold text-center text-blue-dark text-md bg-blue-50">
                Total Producto
              </div>
              <div className="flex-grow inline-block py-1 pr-1 mt-3 font-bold text-right text-blue-dark text-md bg-blue-50">
                {formatPrice(
                  showProductTotal(
                    product?.total_amount_float,
                    product?.["installlation_service"],
                    product?.["warranty_service"]
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end">
        {products.length < 1 && (
          <div className="mt-6 mr-5">
            <p>Su compra está vacía</p>
          </div>
        )}
        {!products.length ? (
          <CustomLink
            content={{ urlPaths: ["/gasodomesticos"] }}
            linkClassName="button button-primary mt-6"
          >
            Ir a la tienda
          </CustomLink>
        ) : (
          <button
            onClick={handleNext}
            className={classNames(
              "mt-6 button button-primary relative flex gap-2 items-center"
            )}
            disabled={isLoading}
          >
            Continuar
          </button>
        )}
      </div>
      {error && (
        <InformationModal
          icon={errorMessage.icon}
          type={errorMessage.type}
          title={errorMessage.title}
          description={errorMessage.description}
          close={() => setError(false)}
        />
      )}
      {(isLoading || isFetchingOrder) && <Spinner position="absolute" size="large" />}
      {isActivedModal && (
        <ModalSuccess {...paramModal} isActive={isActivedModal}>
          {modalChild}
        </ModalSuccess>
      )}
    </HeadingCard>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = [];
  return { paths, fallback: "blocking" };
};

export const revalidate = 60;

export const getStaticProps: GetStaticProps = async (context) => {
  const headerInfo = await getHeader(
    DEFAULT_HEADER_ID,
    context.preview ?? false
  );
  const footerInfo = await getNavigation(
    DEFAULT_FOOTER_ID,
    context.preview ?? false
  );
  const helpButton = await getNavigation(
    DEFAULT_HELP_BUTTON_ID,
    context.preview ?? false
  );
  const cookieInfo = await getNavigation(COOKIES_ID, context.preview ?? false);

  const info = {
    __typename: CONTENTFUL_TYPENAMES.COPY_SET,
    sys: {
      id: DEFAULT_WARRANTY_COPY,
    },
  };
  const copyRes = await getDataContent(info);
  const copyServices = copyRes?.copiesCollection?.items;

  const TermsOfServices = {
    __typename: CONTENTFUL_TYPENAMES.AUX_CUSTOM_CONTENT,
    sys: {
      id: TERMS_OF_SERVICE_ID,
    }
  };
  const termsOfServicesInfo = await getDataContent(TermsOfServices);

  return {
    props: {
      layout: {
        name: "Carrito de compras",
        footerInfo,
        headerInfo,
        helpButton,
        cookieInfo,
        termsOfServicesInfo
      },
      copyServices,
    },
    revalidate,
  };
};

CheckoutVerify.getLayout = (page: ReactElement, pageProps: any) => {
  return defaultLayout(<CheckoutLayout>{page}</CheckoutLayout>, pageProps);
};

export default CheckoutVerify;