import { describe, it, expect } from "vitest";
import AucationCard from "./AucationCard.vue";
import { renderWithProviders } from "../../../test-utils";

const normalize = (text) => text.replace(/\u00a0/g, " ");
const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

const aucation = {
  id: 2,
  title: "Oculus Quest 2",
  cover: "https://cdn.example.com/cover.jpeg",
  start_bid: 5000000,
  closed_at: "2999-12-31 22:00:00",
  author: { name: "Abdullah Ubaid", photo: null },
  bids: [2, 3],
};

describe("AucationCard", () => {
  it("menampilkan ringkasan lelang dan tautan ke detail", async () => {
    const { wrapper } = await renderWithProviders(AucationCard, {
      props: { aucation },
    });

    expect(wrapper.attributes("href")).toBe("/aucations/2");
    expect(byId(wrapper, "card-title").text()).toBe("Oculus Quest 2");
    expect(wrapper.text()).toContain("Abdullah Ubaid");
    expect(normalize(byId(wrapper, "card-start-bid").text())).toBe("Rp 5.000.000");
    expect(byId(wrapper, "card-bids").text()).toBe("2 penawaran");
    expect(byId(wrapper, "card-closed-at").text()).toContain("Desember 2999");
    expect(byId(wrapper, "status-badge").text()).toBe("Dibuka");
    expect(byId(wrapper, "card-cover").attributes("src")).toBe(
      "https://cdn.example.com/cover.jpeg"
    );
    expect(byId(wrapper, "card-cover-fallback").exists()).toBe(false);
  });

  it("menampilkan ikon cadangan jika cover kosong dan status Ditutup", async () => {
    const { wrapper } = await renderWithProviders(AucationCard, {
      props: {
        aucation: {
          ...aucation,
          cover: null,
          closed_at: "2000-01-01 10:00:00",
          bids: [],
        },
      },
    });

    expect(byId(wrapper, "card-cover").exists()).toBe(false);
    expect(byId(wrapper, "card-cover-fallback").exists()).toBe(true);
    expect(byId(wrapper, "status-badge").text()).toBe("Ditutup");
    expect(byId(wrapper, "card-bids").text()).toBe("0 penawaran");
  });
});