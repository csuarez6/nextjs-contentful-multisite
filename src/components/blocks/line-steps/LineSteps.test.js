import React from "react";
import { render } from "@testing-library/react";
import LineSteps from "./LineSteps";
import { data } from "./LineSteps.mock";

jest.mock("@/lib/richtext/default.formatter", () => ({
  defaultFormatOptions: jest.fn(() => ({})),
}));
jest.mock("@/lib/services/render-blocks.service", () => ({
  attachLinksToRichtextContent: jest.fn(),
}));
jest.mock("@/lib/services/render-cards.service", () => jest.fn());

describe("LineStepsBlock", () => {
  test("renders", () => {
    render(<LineSteps {...data} />);
  });
});
