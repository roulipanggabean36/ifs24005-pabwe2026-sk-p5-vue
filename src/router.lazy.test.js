import { routes } from "./router";

describe("lazy route", () => {
  it("memuat semua komponen route yang di-lazy-load", async () => {
    const loaders = [];
    const walk = (list) =>
      list.forEach((r) => {
        if (typeof r.component === "function") loaders.push(r.component);
        if (r.children) walk(r.children);
      });
    walk(routes);

    expect(loaders).toHaveLength(8);
    const modules = await Promise.all(loaders.map((load) => load()));
    modules.forEach((m) => expect(m.default).toBeDefined());
  });
});
