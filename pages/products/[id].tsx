import { useContext } from 'react';
import { useRouter } from 'next/router';
import ProductOverview from "@/components/blocks/product-details/ProductOverview";
import { mockProductOverviewProps } from "@/components/blocks/product-details/ProductOverview.mocks";
import {  PaymentMethodType, IProductOverviewDetails } from "@/lib/interfaces/product-cf.interface";
import CheckoutContext from '@/context/Checkout';
import { mockPageLayoutProps } from '@/components/layouts/page-layout/PageLayout.mocks';

const ProductDetail = () => {
  const router = useRouter();
  const { addToCart } = useContext(CheckoutContext);

  const product: IProductOverviewDetails = {
    ...mockProductOverviewProps.data,
  };

  const buyHandlerMap = {
    [PaymentMethodType.pse]: () => {
      router.push('/checkout/pse/verify');
    }
  };

  const onBuyHandler = (type: PaymentMethodType, skuCode: string, imageProduct: string, namePorduct: string) => {
    addToCart(skuCode, imageProduct, namePorduct);
    if (buyHandlerMap[type]) buyHandlerMap[type]();
  };

  return (
    <ProductOverview {...product} onBuy={onBuyHandler} />
  );
};

ProductDetail.getInitialProps = () => {
  return {
    layout: {
      name: mockPageLayoutProps.data.name,
      footerInfo: mockPageLayoutProps.data.layout.footerInfo,
      headerInfo: mockPageLayoutProps.data.layout.headerInfo,
    },
  };
};

export default ProductDetail;