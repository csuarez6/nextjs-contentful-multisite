import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { mockContentFilterProps } from "./ContentFilter.mocks";
import ContentFilter from "./ContentFilter";
import { useRouter } from "next/router";

const { data } = mockContentFilterProps;

const useRouterMock = () => ({
  asPath: "/",
  push: jest.fn(),
  pathname: ""
});

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/richtext/default.formatter", () => ({
  defaultFormatOptions: jest.fn(() => ({})),
}));
jest.mock("@/lib/services/render-blocks.service", () => ({
  attachLinksToRichtextContent: jest.fn(),
}));
jest.mock("@/lib/services/render-cards.service", () => jest.fn());

describe("ContentFilter data", () => {
  beforeEach(() => {
    useRouter.mockImplementation(useRouterMock);
  });
  test("renders", async () => {
    render(<ContentFilter {...data} />);
  });
});