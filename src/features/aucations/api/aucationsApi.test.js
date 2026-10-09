import { describe, it, expect, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import {
  getAucations,
  getAucationById,
  postAucation,
  putAucation,
  postAucationCover,
  removeAucation,
  removeAllAucations,
  postBid,
  removeBid,
} from "./aucationsApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

const payload = {
  title: "Oculus Quest 2",
  description: "Barang mulus",
  startBid: 5000000,
  closedAt: "2026-12-31 23:59:00",
  extra: "diabaikan",
};

const expectedBody = {
  title: "Oculus Quest 2",
  description: "Barang mulus",
  start_bid: 5000000,
  closed_at: "2026-12-31 23:59:00",
};

describe("aucationsApi", () => {
  it("getAucations tanpa argumen memakai params kosong", async () => {
    apiFetch.mockResolvedValue({ success: true });

    const result = await getAucations();

    expect(apiFetch).toHaveBeenCalledWith("/aucations", { params: {} });
    expect(result).toEqual({ success: true });
  });

  it("getAucations meneruskan params", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await getAucations({ is_me: 1 });

    expect(apiFetch).toHaveBeenCalledWith("/aucations", {
      params: { is_me: 1 },
    });
  });

  it("getAucationById memanggil GET /aucations/:id", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await getAucationById(4);

    expect(apiFetch).toHaveBeenCalledWith("/aucations/4");
  });

  it("postAucation memetakan field ke snake_case", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await postAucation(payload);

    expect(apiFetch).toHaveBeenCalledWith("/aucations", {
      method: "POST",
      body: expectedBody,
    });
  });

  it("putAucation memanggil PUT /aucations/:id", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await putAucation(4, payload);

    expect(apiFetch).toHaveBeenCalledWith("/aucations/4", {
      method: "PUT",
      body: expectedBody,
    });
  });

  it("postAucationCover mengirim FormData berisi field cover", async () => {
    apiFetch.mockResolvedValue({ success: true });
    const file = new File(["x"], "cover.png", { type: "image/png" });

    await postAucationCover(4, file);

    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/aucations/4/cover");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("cover")).toBe(file);
  });

  it("removeAucation memanggil DELETE /aucations/:id", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await removeAucation(4);

    expect(apiFetch).toHaveBeenCalledWith("/aucations/4", { method: "DELETE" });
  });

  it("removeAllAucations memanggil DELETE /aucations", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await removeAllAucations();

    expect(apiFetch).toHaveBeenCalledWith("/aucations", { method: "DELETE" });
  });

  it("postBid memanggil POST /aucations/:id/bids", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await postBid(4, 7000000);

    expect(apiFetch).toHaveBeenCalledWith("/aucations/4/bids", {
      method: "POST",
      body: { bid: 7000000 },
    });
  });

  it("removeBid memanggil DELETE /aucations/:id/bids", async () => {
    apiFetch.mockResolvedValue({ success: true });

    await removeBid(4);

    expect(apiFetch).toHaveBeenCalledWith("/aucations/4/bids", {
      method: "DELETE",
    });
  });
});