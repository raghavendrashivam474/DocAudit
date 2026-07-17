
// ─── Primitives ───────────────────────────────────────────────────────────────

export interface TextSpan {
  readonly text: string;
  readonly line: number;
  readonly startOffset: number;
  readonly endOffset: number;
}

// ─── Heading ──────────────────────────────────────────────────────────────────

export interface DocHeading {
  readonly level: number;
  readonly text: string;
  readonly line: number;
  readonly id: string;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface DocSection {
  readonly heading: DocHeading;
  readonly depth: number;
  readonly content: string;
  readonly paragraphs: readonly DocParagraph[];
  readonly codeBlocks: readonly DocCodeBlock[];
  readonly links: readonly DocLink[];
  readonly images: readonly DocImage[];
  readonly lists: readonly DocList[];
  readonly tables: readonly DocTable[];
  readonly children: readonly DocSection[];
}

// ─── Paragraph ────────────────────────────────────────────────────────────────

export interface DocParagraph {
  readonly text: string;
  readonly line: number;
  readonly wordCount: number;
}

// ─── Code Block ───────────────────────────────────────────────────────────────

export interface DocCodeBlock {
  readonly language: string | undefined;
  readonly content: string;
  readonly line: number;
  readonly lineCount: number;
}

// ─── Link ─────────────────────────────────────────────────────────────────────

export type LinkType = "inline" | "reference" | "autolink";

export interface DocLink {
  readonly text: string;
  readonly url: string;
  readonly type: LinkType;
  readonly line: number;
  readonly isExternal: boolean;
}

// ─── Image ────────────────────────────────────────────────────────────────────

export interface DocImage {
  readonly alt: string;
  readonly url: string;
  readonly title: string | undefined;
  readonly line: number;
  readonly isBadge: boolean;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export type ListKind = "ordered" | "unordered";

export interface DocListItem {
  readonly text: string;
  readonly line: number;
}

export interface DocList {
  readonly kind: ListKind;
  readonly items: readonly DocListItem[];
  readonly line: number;
}

// ─── Table ────────────────────────────────────────────────────────────────────

export interface DocTable {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly line: number;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface DocBadge {
  readonly image: DocImage;
  readonly link: DocLink | undefined;
  readonly line: number;
}

// ─── Semantic Document ────────────────────────────────────────────────────────

export interface SemanticDocument {
  readonly title: string | undefined;
  readonly description: string | undefined;
  readonly headings: readonly DocHeading[];
  readonly sections: readonly DocSection[];
  readonly paragraphs: readonly DocParagraph[];
  readonly codeBlocks: readonly DocCodeBlock[];
  readonly links: readonly DocLink[];
  readonly images: readonly DocImage[];
  readonly badges: readonly DocBadge[];
  readonly lists: readonly DocList[];
  readonly tables: readonly DocTable[];
  readonly lineCount: number;
  readonly wordCount: number;
  readonly rawContent: string;
}
