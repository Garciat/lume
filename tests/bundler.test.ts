import { assert, assertStrictEquals as equals } from "../deps/assert.ts";
import { build, getSite, testPage } from "./utils.ts";
import bundler from "../plugins/bundler.ts";

Deno.test("bundler plugin", async () => {
  const site = getSite({
    test: true,
    src: "bundler",
  });

  site.ignore("modules");
  site.use(bundler({
    extensions: [".ts", ".tsx"],
    options: {
      bundle: "module",
    },
  }));

  await build(site);

  // Register the loader extensions
  assert(site.source.assets.has(".ts"));
  assert(site.source.assets.has(".tsx"));
  assert(site.source.pages.has(".ts"));
  assert(site.source.pages.has(".tsx"));

  testPage(site, "/main", (page) => {
    equals(page.dest.path, "/main");
    equals(page.dest.ext, ".js");
    const content = page.content as string;
    assert(content.includes('createElement("h1", null, salute)'));
  });
});

Deno.test("bundler plugin (not bundle)", async () => {
  const site = getSite({
    test: true,
    src: "bundler",
  });

  site.use(bundler({
    extensions: [".ts", ".tsx"],
  }));

  await build(site);

  // Register the loader extensions
  testPage(site, "/main", (page) => {
    equals(page.dest.path, "/main");
    equals(page.dest.ext, ".js");
    const content = page.content as string;
    assert(content.includes('import Title from "./modules/title.js";'));
  });

  testPage(site, "/modules/utils", (page) => {
    const content = page.content as string;
    assert(content.includes("return `Hello, ${name}`;"));
  });

  testPage(site, "/modules/title", (page) => {
    const content = page.content as string;
    assert(content.includes('React.createElement("h1", null, salute),'));
  });
});