import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SKILL_PATH = join(ROOT, ".claude", "skills", "ponytail", "SKILL.md");

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val === ">" || val === "|") {
      const parts: string[] = [];
      i++;
      while (i < lines.length && /^  /.test(lines[i])) {
        parts.push(lines[i].replace(/^  /, "").trim());
        i++;
      }
      i--;
      val = parts.join(" ").replace(/\s+/g, " ").trim();
    }
    if (val) out[key] = val;
  }
  return out;
}

describe("ponytail SKILL.md teaches YAGNI", () => {
  test("fixture: canonical path exists with ponytail frontmatter", () => {
    const content = readFileSync(SKILL_PATH, "utf8");
    const fm = parseFrontmatter(content);
    expect(fm.name).toBe("ponytail");
    expect(fm.description?.length ?? 0).toBeGreaterThan(20);
  });

  test("description and body mention YAGNI / smallest-change themes", () => {
    const content = readFileSync(SKILL_PATH, "utf8").toLowerCase();
    const teachesYagni =
      content.includes("yagni") ||
      (content.includes("smallest") && content.includes("change"));
    expect(teachesYagni).toBe(true);
    expect(content).toContain("/ponytail");
    expect(content).toMatch(/full|lite|ultra/);
  });
});
