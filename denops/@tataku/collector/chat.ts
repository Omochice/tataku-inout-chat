import type { Denops } from "jsr:@denops/std@7.4.0";
import * as fn from "jsr:@denops/std@7.4.0/function";
import {
  as,
  assert,
  is,
  type PredicateType,
} from "jsr:@core/unknownutil@4.3.0";
import { CollectorFactory } from "jsr:@omochice/tataku-vim@1.1.0";
import { unified } from "npm:unified@11.0.5";
import remarkParse from "npm:remark-parse@11.0.0";
import { extract } from "jsr:@std/front-matter@1.0.5/any";
import { test } from "jsr:@std/front-matter@1.0.5/test";

const collector: CollectorFactory = (denops: Denops) => {
  return new ReadableStream<string[]>({
    start: async (controller: ReadableStreamDefaultController<string[]>) => {
      const bufnr = await fn.bufnr(denops, "sample");
      if (bufnr === -1) {
        const err = new Error(
          `buffer "sample" is seems like not existed.`,
        );
        controller.error(err);
        throw err;
      }
      const text = (await fn.getbufline(denops, bufnr, 0, "$"))
        .join("\n");
      controller.enqueue(getSections(text));
    },
  });
};

const parser = unified()
  .use(remarkParse);

function getSections(txt: string) {
  const body = test(txt) ? extract(txt).body : txt;
  const file = parser.parse(body);
  const results: [string, ...string[]] = [""];

  for (const node of file.children) {
    if (node.type === "thematicBreak") {
      results.push("");
      continue;
    }
    const t = body.substring(
      node.position?.start.offset!,
      node.position?.end.offset!,
    );
    results.push(results.pop() + t);
  }
  return results;
}

export default collector;
