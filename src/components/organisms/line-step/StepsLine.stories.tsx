import { ComponentStory, ComponentMeta } from '@storybook/react';
import StepsLine, { IStepList } from "./StepsLine";
import { mockStepsLineProps } from './StepsLine.mocks';

export default {
  title: 'Organisms/StepsLine',
  component: StepsLine,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component: 'This is an example component to guide for create new components, remember update **this** description (_markdown_ is supported)',
      },
    },
  },
} as ComponentMeta<typeof StepsLine>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StepsLine> = (args) => (
  <StepsLine {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockStepsLineProps.data
} as IStepList;