import { ComponentStory, ComponentMeta } from '@storybook/react';
import ProductGrill from './ProductGrill';
import { IPromoBlock } from "@/lib/interfaces/promo-content-cf.interface";
import { mockProductGrillProps } from './ProductGrill.mocks';

export default {
  title: 'blocks/ProductGrill',
  component: ProductGrill,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component: 'This is an example component to guide for create new components, remember update **this** description (_markdown_ is supported)',
      },
    },
  },
} as ComponentMeta<typeof ProductGrill>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ProductGrill> = (args) => (
    <ProductGrill {...args} />
);

export const Base = Template.bind({});
export const ListedContents = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockProductGrillProps.data,
} as IPromoBlock;

ListedContents.args = {
  ...mockProductGrillProps.dataListedContents,
} as IPromoBlock;
