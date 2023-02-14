import { Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Image from "next/image";

const defaultFormatOptions: Options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { url, title, description, width, height } = node.data.target;
      return url ? (
        <>
          <figure className="w-full mt-10 block text-center">
            <Image
              src={url}
              className="w-auto h-auto max-w-full"
              alt={description && description != "" ? description : title}
              width={width}
              height={height}
            />
          </figure>
        </>
      ) : null;
    },
    [BLOCKS.HR]: () => {
      return <div className="my-5"></div>;
    },
    [BLOCKS.PARAGRAPH]: (_node, children) => {
      return <p className="text-size-p3 mb-6">{children}</p>;
    },
    [BLOCKS.HEADING_1]: (_node, children) => {
      return <h1 className="mb-3">{children}</h1>;
    },
    [BLOCKS.HEADING_2]: (_node, children) => {
      return <h2 className="mb-3">{children}</h2>;
    },
    [BLOCKS.HEADING_3]: (_node, children) => {
      return <h3 className="mb-3">{children}</h3>;
    },
    [BLOCKS.HEADING_4]: (_node, children) => {
      return <h4 className="mb-3">{children}</h4>;
    },
    [BLOCKS.HEADING_5]: (_node, children) => {
      return <h5 className="mb-3">{children}</h5>;
    },
    [BLOCKS.HEADING_6]: (_node, children) => {
      return <h6 className="mb-3">{children}</h6>;
    },
    [BLOCKS.UL_LIST]: (_node: any, children: any) => {
      return <ul className="list-disc list-inside">{children}</ul>;
    },
    [BLOCKS.OL_LIST]: (_node: any, children: any) => {
      return <ol className="list-decimal list-inside">{children}</ol>;
    },
    [BLOCKS.LIST_ITEM]: (_node: any, children: any) => {
      return (
        <li>
          <div className="inline-block w-fit max-w-[calc(100%-50px)] align-top">
            {children}
          </div>
        </li>
      );
    },
    [BLOCKS.TABLE]: (_node: any, children: any) => (
      <table className="table-auto w-full border-separate rounded-lg border-spacing-0 border border-neutral-80 overflow-hidden">
        <tbody>{children}</tbody>
      </table>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => {
      return (
        <th className="px-6 py-4 title is-4 bg-neutral-90 text-grey-10 !font-semibold">
          {children}
        </th>
      );
    },
    [BLOCKS.TABLE_ROW]: (_node: any, children: any) => (
      <tr className="text-center border-neutral-80">{children}</tr>
    ),
    [BLOCKS.TABLE_CELL]: (_node: any, children: any) => (
      <td className="px-6 py-4 first:bg-grey-90 border-t border-neutral-80 text-center first:text-left text-grey-30 first:text-grey-10 leading-none">{children}</td>
    ),
    [BLOCKS.QUOTE]: (_node, children) => {
      return (
        <blockquote className="ml-4 border-l-8 border-l-neutral-100 pl-4">
          {children}
        </blockquote>
      );
    },
    [INLINES.HYPERLINK]: (node, children) => {
      let isButton = false;
      for (const ct of node.content) {
        if (!ct["marks"] || ct["marks"] == undefined || ct["marks"] == null) {
          continue;
        }
        const marks = ct["marks"];

        isButton = marks.some((m) => m.type == "italic");
        if (isButton) {
          break;
        }
      }

      return (
        <a
          className={`text-violet-500 underline ${
            isButton ? "inline-cta-button" : ""
          }`}
          href={node.data.uri}
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      );
    },
  },
};

export default defaultFormatOptions;