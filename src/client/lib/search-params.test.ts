import { describe, expect, it } from "vitest";
import {
  buildShareUrl,
  searchParamsToTableState,
  tableStateToSearchParams,
} from "./search-params";

describe("searchParamsToTableState", () => {
  it("parses sort parameter", () => {
    const state = searchParamsToTableState({ sort: "fm_date:desc" });

    expect(state.sorting).toEqual([{ id: "fm_date", desc: true }]);
  });

  it("parses multiple sort parameters", () => {
    const state = searchParamsToTableState({
      sort: "fm_date:desc,fm_title:asc",
    });

    expect(state.sorting).toEqual([
      { id: "fm_date", desc: true },
      { id: "fm_title", desc: false },
    ]);
  });

  it("parses filter parameter", () => {
    const state = searchParamsToTableState({ filter: "fm_category:testing" });

    expect(state.columnFilters).toEqual([
      { id: "fm_category", value: "testing" },
    ]);
  });

  it("parses multiple filter parameters", () => {
    const state = searchParamsToTableState({
      filter: "fm_category:testing,fm_status:done",
    });

    expect(state.columnFilters).toEqual([
      { id: "fm_category", value: "testing" },
      { id: "fm_status", value: "done" },
    ]);
  });

  it("handles filter values containing colons", () => {
    const state = searchParamsToTableState({
      filter: "fm_url:https://example.com",
    });

    expect(state.columnFilters).toEqual([
      { id: "fm_url", value: "https://example.com" },
    ]);
  });

  it("parses global search parameter", () => {
    const state = searchParamsToTableState({ q: "Next.js" });

    expect(state.globalFilter).toBe("Next.js");
  });

  it("returns empty state for empty params", () => {
    const state = searchParamsToTableState({});

    expect(state.sorting).toEqual([]);
    expect(state.columnFilters).toEqual([]);
    expect(state.globalFilter).toBe("");
  });
});

describe("tableStateToSearchParams", () => {
  it("serializes sorting", () => {
    const params = tableStateToSearchParams({
      sorting: [{ id: "fm_date", desc: true }],
      columnFilters: [],
      globalFilter: "",
    });

    expect(params.sort).toBe("fm_date:desc");
  });

  it("serializes multiple sorts", () => {
    const params = tableStateToSearchParams({
      sorting: [
        { id: "fm_date", desc: true },
        { id: "fm_title", desc: false },
      ],
      columnFilters: [],
      globalFilter: "",
    });

    expect(params.sort).toBe("fm_date:desc,fm_title:asc");
  });

  it("serializes column filters", () => {
    const params = tableStateToSearchParams({
      sorting: [],
      columnFilters: [{ id: "fm_category", value: "testing" }],
      globalFilter: "",
    });

    expect(params.filter).toBe("fm_category:testing");
  });

  it("serializes global filter", () => {
    const params = tableStateToSearchParams({
      sorting: [],
      columnFilters: [],
      globalFilter: "Next.js",
    });

    expect(params.q).toBe("Next.js");
  });

  it("omits empty values", () => {
    const params = tableStateToSearchParams({
      sorting: [],
      columnFilters: [],
      globalFilter: "",
    });

    expect(params.sort).toBeUndefined();
    expect(params.filter).toBeUndefined();
    expect(params.q).toBeUndefined();
  });
});

describe("round-trip", () => {
  it("preserves state through serialize/deserialize", () => {
    const original = {
      sorting: [
        { id: "fm_date", desc: true },
        { id: "fm_title", desc: false },
      ],
      columnFilters: [
        { id: "fm_category", value: "testing" },
        { id: "fm_status", value: "done" },
      ],
      globalFilter: "search term",
    };

    const params = tableStateToSearchParams(original);
    const restored = searchParamsToTableState(params);

    expect(restored).toEqual(original);
  });
});

describe("buildShareUrl", () => {
  const origin = "http://localhost:3000";

  it("builds URL with all params", () => {
    const url = buildShareUrl(
      { sort: "fm_date:desc", filter: "fm_category:testing", q: "Next" },
      origin,
    );

    expect(url).toContain("sort=fm_date%3Adesc");
    expect(url).toContain("filter=fm_category%3Atesting");
    expect(url).toContain("q=Next");
  });

  it("omits undefined params", () => {
    const url = buildShareUrl({ sort: "fm_date:desc" }, origin);

    expect(url).toContain("sort=");
    expect(url).not.toContain("filter=");
    expect(url).not.toContain("q=");
  });
});
