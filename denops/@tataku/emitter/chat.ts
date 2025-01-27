import type { Denops } from "jsr:@denops/std@7.4.0";
import * as fn from "jsr:@denops/std@7.4.0/function";

const initialize = async (denops: Denops) => {
  const bufnr = await fn.bufnr(denops, "sample");
  const linenr = await fn.line(denops, "$");
  await fn.appendbufline(denops, bufnr, linenr, ["", "---", ""]);
  return { bufnr };
};

const emitter = (denops: Denops) => {
  const state = { initialized: false, bufnr: -1 };
  return new WritableStream<string[]>({
    write: async (chunk: string[]) => {
      if (!state.initialized) {
        state.bufnr = (await initialize(denops)).bufnr;
        state.initialized = true;
      }
      const linenr = await fn.line(denops, "$");
      const lastLine = await fn.getbufline(denops, state.bufnr, linenr);
      const [currentLine, ...newLines] = chunk.join("").split(/\r?\n/);

      await fn.setbufline(
        denops,
        state.bufnr,
        linenr,
        lastLine + currentLine,
      );
      if (newLines.length > 0) {
        await fn.appendbufline(
          denops,
          state.bufnr,
          linenr,
          newLines,
        );
      }
    },
  });
};

export default emitter;
