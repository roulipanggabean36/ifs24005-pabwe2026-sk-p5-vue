import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  buildQueryString,
  apiFetch,
} from "./apiHelper";

describe("apiHelper - token", () => {
  it("getAccessToken mengembalikan null jika belum ada token", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("putAccessToken menyimpan token dan getAccessToken membacanya", () => {
    putAccessToken("abc123");
    expect(getAccessToken()).toBe("abc123");
  });

  it("removeAccessToken menghapus token", () => {
    putAccessToken("abc123");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiHelper - buildQueryString", () => {
  it("mengembalikan string kosong jika params kosong", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("mengabaikan undefined, null, dan string kosong", () => {
    expect(
      buildQueryString({ a: undefined, b: null, c: "", d: "ok" })
    ).toBe("?d=ok");
  });

  it("mempertahankan nilai 0 dan false", () => {
    expect(buildQueryString({ page: 0, is_me: false })).toBe(
      "?page=0&is_me=false"
    );
  });

  it("mengembalikan string kosong jika semua nilai diabaikan", () => {
    expect(buildQueryString({ a: undefined })).toBe("");
  });
});

describe("apiHelper - apiFetch", () => {
  let fetchMock;

  const mockResponse = (data) => ({ json: vi.fn().mockResolvedValue(data) });

  beforeEach(() => {
    fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse({ status: "success", message: "ok" }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("memakai method GET tanpa Authorization jika tidak ada token", async () => {
    const result = await apiFetch("/ping");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/ping`);
    expect(init.method).toBe("GET");
    expect(init.headers).toEqual({});
    expect(init.body).toBeUndefined();
    expect(result).toEqual({ status: "success", message: "ok", success: true });
  });

  it("menambahkan header Authorization jika token ada", async () => {
    putAccessToken("token-xyz");
    await apiFetch("/users/me");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer token-xyz");
  });

  it("tidak menambahkan Authorization jika auth = false", async () => {
    putAccessToken("token-xyz");
    await apiFetch("/auth/login", { method: "POST", body: {}, auth: false });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("menyusun query string dari params", async () => {
    await apiFetch("/aucations", { params: { is_me: 1, q: "" } });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/aucations?is_me=1`);
  });

  it("mengirim body object sebagai JSON", async () => {
    await apiFetch("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(
      JSON.stringify({ email: "a@b.c", password: "123456" })
    );
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const formData = new FormData();
    formData.append("cover", new Blob(["x"]), "cover.png");

    await apiFetch("/aucations/1/cover", { method: "POST", body: formData });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(formData);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("success = false jika status dari server bukan success", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ status: "fail", message: "Unauthorized" })
    );

    const result = await apiFetch("/users/me");
    expect(result).toEqual({
      status: "fail",
      message: "Unauthorized",
      success: false,
    });
  });

  it("mengembalikan pesan fallback jika terjadi error jaringan", async () => {
    fetchMock.mockRejectedValue(new Error("Network down"));

    const result = await apiFetch("/ping");
    expect(result).toEqual({
      success: false,
      message: "Tidak dapat terhubung ke server",
      data: null,
    });
  });
});