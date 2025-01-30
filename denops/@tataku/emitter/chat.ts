import type { Denops } from "jsr:@denops/std@7.4.0";
import * as fn from "jsr:@denops/std@7.4.0/function";
import { as, assert, is } from "jsr:@core/unknownutil@4.3.0";

const isOption = is.ObjectOf({
  bufname: as.Optional(is.String),
});

const initialize = async (denops: Denops, bufname: string) => {
  const bufnr = await fn.bufnr(denops, bufname);
  const linenr = await fn.line(denops, "$");
  await fn.appendbufline(denops, bufnr, linenr, ["", "---", "", ""]);
  return { bufnr };
};

const emitter = (denops: Denops, option: unknown) => {
  assert(option, isOption);
  const state = { initialized: false, bufnr: -1 };
  const bufname = option.bufname ?? "sample";
  return new WritableStream<string[]>({
    write: async (chunk: string[]) => {
      if (!state.initialized) {
        state.bufnr = (await initialize(denops, bufname)).bufnr;
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
    close: async () => {
      await fn.appendbufline(denops, state.bufnr, "$", ["", "---", ""]);
    },
  });
};

export default emitter;
