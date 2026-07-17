export interface Heading {
  readonly level: number;
  readonly text: string;
  readonly line: number;
}

export function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

export function normalizeHeading(text: string): string {
  return text.trim().toLowerCase();
}

export function hasFencedCodeBlock(content: string): boolean {
  return /```[\s\S]*?```/m.test(content);
}

export function extractHeadings(content: string): Heading[] {
  const lines = splitLines(content);
  const headings: Heading[] = [];

  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line === undefined) {
      continue;
    }

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const match = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
    if (match === null) {
      continue;
    }

    const hashes = match[1];
    const text = match[2];

    if (hashes === undefined || text === undefined) {
      continue;
    }

    headings.push({
      level: hashes.length,
      text: text.trim(),
      line: i + 1,
    });
  }

  return headings;
}
