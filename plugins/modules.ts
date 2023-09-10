import loader from "../core/loaders/module.ts";
import { merge } from "../core/utils.ts";

import type { Data, Engine, Helper, Site } from "../core.ts";

export interface Options {
  /** The list of extensions this plugin applies to */
  extensions: string[];

  /** Optional sub-extension for page files */
  pageSubExtension?: string;

  /**
   * Custom includes path
   * @default `site.options.includes`
   */
  includes: string;
}

// Default options
export const defaults: Options = {
  extensions: [".js", ".ts"],
  pageSubExtension: ".page",
  includes: "",
};

/** Template engine to render js/ts files */
export class ModuleEngine implements Engine {
  helpers: Record<string, Helper> = {};
  includes: string;

  constructor(includes: string) {
    this.includes = includes;
  }

  deleteCache() {}

  async render(content: unknown, data: Data): Promise<unknown> {
    return typeof content === "function"
      ? await content(data, this.helpers)
      : content;
  }

  renderComponent(content: unknown, data: Data): string {
    return typeof content === "function"
      ? content(data, this.helpers)
      : content;
  }

  addHelper(name: string, fn: Helper) {
    this.helpers[name] = fn;
  }
}

/** Register the plugin to load JavaScript/TypeScript modules */
export default function (userOptions?: Partial<Options>) {
  return (site: Site) => {
    const options = merge(
      { ...defaults, includes: site.options.includes },
      userOptions,
    );

    const engine = new ModuleEngine(options.includes);

    site.loadData(options.extensions, loader);
    site.loadPages(options.extensions, {
      loader,
      engine,
      subExtension: options.pageSubExtension,
    });
  };
}
