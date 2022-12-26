import getEntryContent from "./entry-content.service";

const getReferencesContent = async (content, references, preview = false) => {
  const referencesContent = {};

  for (const ref of references) {
    if (
      !content[ref] || content[ref] === null
      || (
        content[ref]?.items && (
          content[ref]?.items === null || content[ref]?.items.length === 0
        )
      )
    ) {
      continue;
    }

    if (content[ref].items) {
      referencesContent[ref] = {
        items: []
      };

      for (const idx in content[ref].items) {
        const blockInfo = content[ref].items[idx];
        const entryInfo = await getEntryContent(blockInfo, preview);

        referencesContent[ref].items.push(entryInfo);
      }
    }

    if (content[ref]?.sys?.id) {
      referencesContent[ref] = await getEntryContent(content[ref], preview);
    }
  }

  return referencesContent;
};

export default getReferencesContent;