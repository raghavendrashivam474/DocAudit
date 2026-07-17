import type {
  SemanticDocument,
  DocHeading,
  DocSection,
  DocParagraph,
  DocCodeBlock,
  DocLink,
  DocImage,
  DocBadge,
  DocList,
  DocListItem,
  DocTable,
} from "@docaudit/shared";

// ─── Line helpers ─────────────────────────────────────────────────────────────

function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function isBadgeUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("shields.io") ||
    lower.includes("badgen.net") ||
    lower.includes("badge") ||
    lower.includes("img.shields")
  );
}

// ─── Extraction functions ─────────────────────────────────────────────────────

function extractHeadings(lines: string[]): DocHeading[] {
  const headings: DocHeading[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
    if (match === null) continue;

    const hashes = match[1];
    const text = match[2];
    if (hashes === undefined || text === undefined) continue;

    headings.push({
      level: hashes.length,
      text: text.trim(),
      line: i + 1,
      id: slugify(text.trim()),
    });
  }

  return headings;
}

function extractCodeBlocks(lines: string[]): DocCodeBlock[] {
  const blocks: DocCodeBlock[] = [];
  let inFence = false;
  let fenceStart = 0;
  let language: string | undefined;
  let blockLines: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    const fenceMatch = /^\s*```(\w*)/.exec(line);

    if (fenceMatch !== null && !inFence) {
      inFence = true;
      fenceStart = i + 1;
      language = fenceMatch[1] !== undefined && fenceMatch[1].length > 0
        ? fenceMatch[1]
        : undefined;
      blockLines = [];
    } else if (/^\s*```\s*$/.test(line) && inFence) {
      blocks.push({
        language,
        content: blockLines.join("\n"),
        line: fenceStart,
        lineCount: blockLines.length,
      });
      inFence = false;
      blockLines = [];
    } else if (inFence) {
      blockLines.push(line);
    }
  }

  return blocks;
}

function extractLinks(lines: string[]): DocLink[] {
  const links: DocLink[] = [];
  let inFence = false;
  const inlineLinkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    let match;
    inlineLinkPattern.lastIndex = 0;
    while ((match = inlineLinkPattern.exec(line)) !== null) {
      const text = match[1] ?? "";
      const url = match[2] ?? "";

      // Skip image syntax ![alt](url)
      const prefix = line[match.index - 1];
      if (prefix === "!") continue;

      links.push({
        text,
        url,
        type: "inline",
        line: i + 1,
        isExternal: isExternal(url),
      });
    }
  }

  return links;
}

function extractImages(lines: string[]): DocImage[] {
  const images: DocImage[] = [];
  let inFence = false;
  const imgPattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    let match;
    imgPattern.lastIndex = 0;
    while ((match = imgPattern.exec(line)) !== null) {
      const alt = match[1] ?? "";
      const url = match[2] ?? "";
      const title = match[3];

      images.push({
        alt,
        url,
        title,
        line: i + 1,
        isBadge: isBadgeUrl(url),
      });
    }
  }

  return images;
}

function extractBadges(images: DocImage[], links: DocLink[]): DocBadge[] {
  return images
    .filter((img) => img.isBadge)
    .map((img) => {
      const linkedFrom = links.find(
        (link) => link.line === img.line && link.text === ""
      );
      return {
        image: img,
        link: linkedFrom,
        line: img.line,
      };
    });
}

function extractLists(lines: string[]): DocList[] {
  const lists: DocList[] = [];
  let inFence = false;
  let currentItems: DocListItem[] = [];
  let currentKind: "ordered" | "unordered" | undefined;
  let listStartLine = 0;

  function flushList(): void {
    if (currentItems.length > 0 && currentKind !== undefined) {
      lists.push({
        kind: currentKind,
        items: [...currentItems],
        line: listStartLine,
      });
    }
    currentItems = [];
    currentKind = undefined;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      if (inFence) flushList();
      continue;
    }
    if (inFence) continue;

    const ulMatch = /^\s*[-*+]\s+(.+)/.exec(line);
    const olMatch = /^\s*\d+[.)]\s+(.+)/.exec(line);

    if (ulMatch !== null) {
      if (currentKind !== "unordered") flushList();
      if (currentKind === undefined) {
        currentKind = "unordered";
        listStartLine = i + 1;
      }
      currentItems.push({ text: ulMatch[1] ?? "", line: i + 1 });
    } else if (olMatch !== null) {
      if (currentKind !== "ordered") flushList();
      if (currentKind === undefined) {
        currentKind = "ordered";
        listStartLine = i + 1;
      }
      currentItems.push({ text: olMatch[1] ?? "", line: i + 1 });
    } else if (line.trim().length === 0) {
      // blank line may separate lists
    } else {
      flushList();
    }
  }

  flushList();
  return lists;
}

function extractTables(lines: string[]): DocTable[] {
  const tables: DocTable[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Detect header row followed by separator
    if (!line.includes("|")) continue;

    const nextLine = lines[i + 1];
    if (nextLine === undefined || !/^\s*\|?\s*[-:]+/.test(nextLine)) continue;

    // Parse header
    const headers = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    // Skip separator
    const rows: string[][] = [];
    let j = i + 2;

    while (j < lines.length) {
      const rowLine = lines[j];
      if (rowLine === undefined || !rowLine.includes("|")) break;

      const cells = rowLine
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);

      rows.push(cells);
      j += 1;
    }

    tables.push({ headers, rows, line: i + 1 });
    // Skip past the table we just parsed
    i = j - 1;
  }

  return tables;
}

function extractParagraphs(lines: string[]): DocParagraph[] {
  const paragraphs: DocParagraph[] = [];
  let inFence = false;
  let paraLines: string[] = [];
  let paraStart = 0;

  function flushPara(): void {
    if (paraLines.length > 0) {
      const text = paraLines.join(" ").trim();
      if (text.length > 0) {
        paragraphs.push({
          text,
          line: paraStart,
          wordCount: countWords(text),
        });
      }
    }
    paraLines = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) continue;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      flushPara();
      continue;
    }
    if (inFence) continue;

    const trimmed = line.trim();

    // Skip headings, list items, table rows, blank lines
    if (
      trimmed.length === 0 ||
      /^#{1,6}\s/.test(trimmed) ||
      /^\s*[-*+]\s/.test(line) ||
      /^\s*\d+[.)]\s/.test(line) ||
      trimmed.includes("|")
    ) {
      flushPara();
      continue;
    }

    if (paraLines.length === 0) {
      paraStart = i + 1;
    }
    paraLines.push(trimmed);
  }

  flushPara();
  return paragraphs;
}

function buildSections(
  headings: DocHeading[],
  lines: string[],
  paragraphs: DocParagraph[],
  codeBlocks: DocCodeBlock[],
  links: DocLink[],
  images: DocImage[],
  lists: DocList[],
  tables: DocTable[]
): DocSection[] {
  if (headings.length === 0) return [];

  function inRange(itemLine: number, startLine: number, endLine: number): boolean {
    return itemLine >= startLine && itemLine < endLine;
  }

  function buildSection(index: number): DocSection {
    const heading = headings[index];
    if (heading === undefined) {
      throw new Error(`Heading at index ${String(index)} is undefined`);
    }

    // Find the end of this section (next heading of same or higher level)
    let endLine = lines.length + 1;
    for (let j = index + 1; j < headings.length; j += 1) {
      const next = headings[j];
      if (next !== undefined && next.level <= heading.level) {
        endLine = next.line;
        break;
      }
    }

    const sectionLines = lines.slice(heading.line, endLine - 1);
    const content = sectionLines.join("\n").trim();

    // Find direct children (headings one level deeper within range)
    const children: DocSection[] = [];
    for (let j = index + 1; j < headings.length; j += 1) {
      const child = headings[j];
      if (child === undefined) continue;
      if (child.line >= endLine) break;
      if (child.level === heading.level + 1) {
        children.push(buildSection(j));
      }
    }

    return {
      heading,
      depth: heading.level,
      content,
      paragraphs: paragraphs.filter((p) => inRange(p.line, heading.line, endLine)),
      codeBlocks: codeBlocks.filter((c) => inRange(c.line, heading.line, endLine)),
      links: links.filter((l) => inRange(l.line, heading.line, endLine)),
      images: images.filter((img) => inRange(img.line, heading.line, endLine)),
      lists: lists.filter((l) => inRange(l.line, heading.line, endLine)),
      tables: tables.filter((t) => inRange(t.line, heading.line, endLine)),
      children,
    };
  }

  // Top-level sections are the highest-level headings
  const topLevel: DocSection[] = [];
  const minLevel = Math.min(...headings.map((h) => h.level));

  for (let i = 0; i < headings.length; i += 1) {
    const h = headings[i];
    if (h !== undefined && h.level === minLevel) {
      topLevel.push(buildSection(i));
    }
  }

  return topLevel;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses raw Markdown content into a SemanticDocument.
 *
 * This is the single point of Markdown parsing in the entire system.
 * All analyzers consume SemanticDocument — never raw Markdown.
 */
export function parseMarkdown(content: string): SemanticDocument {
  const lines = splitLines(content);
  const headings = extractHeadings(lines);
  const codeBlocks = extractCodeBlocks(lines);
  const links = extractLinks(lines);
  const images = extractImages(lines);
  const badges = extractBadges(images, links);
  const lists = extractLists(lines);
  const tables = extractTables(lines);
  const paragraphs = extractParagraphs(lines);

  const sections = buildSections(
    headings, lines, paragraphs, codeBlocks, links, images, lists, tables
  );

  // Title = first H1, or first heading of any kind
  const h1 = headings.find((h) => h.level === 1);
  const title = h1?.text ?? headings[0]?.text;

  // Description = first paragraph after title
  const titleLine = h1?.line ?? headings[0]?.line ?? 0;
  const description = paragraphs.find((p) => p.line > titleLine)?.text;

  const totalWordCount = paragraphs.reduce((sum, p) => sum + p.wordCount, 0);

  return {
    title,
    description,
    headings,
    sections,
    paragraphs,
    codeBlocks,
    links,
    images,
    badges,
    lists,
    tables,
    lineCount: lines.length,
    wordCount: totalWordCount,
    rawContent: content,
  };
}
