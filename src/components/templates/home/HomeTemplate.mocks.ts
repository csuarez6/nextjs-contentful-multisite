import { mockPageLayoutProps } from '@/components/layouts/page-layout/PageLayout.mocks';
import { IPage } from '@/lib/interfaces/page-cf.interface';

const data: IPage = {
  name: 'Home Template',
  layout: {
    name: 'Home Template',
    headerInfo: mockPageLayoutProps.data.layout.headerInfo,
    footerInfo: mockPageLayoutProps.data.layout.footerInfo,
  }
};

export const mockHomeTemplateProps = {
  data,
};
