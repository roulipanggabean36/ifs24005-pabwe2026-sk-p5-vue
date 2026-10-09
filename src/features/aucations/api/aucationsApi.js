import { apiFetch } from "../../../helpers/apiHelper";

export function getAucations(params = {}) {
  return apiFetch("/aucations", { params });
}

export function getAucationById(id) {
  return apiFetch(`/aucations/${id}`);
}

export function postAucation({ title, description, startBid, closedAt }) {
  return apiFetch("/aucations", {
    method: "POST",
    body: {
      title,
      description,
      start_bid: startBid,
      closed_at: closedAt,
    },
  });
}

export function putAucation(id, { title, description, startBid, closedAt }) {
  return apiFetch(`/aucations/${id}`, {
    method: "PUT",
    body: {
      title,
      description,
      start_bid: startBid,
      closed_at: closedAt,
    },
  });
}

export function postAucationCover(id, file) {
  const formData = new FormData();
  formData.append("cover", file);

  return apiFetch(`/aucations/${id}/cover`, {
    method: "POST",
    body: formData,
  });
}

export function removeAucation(id) {
  return apiFetch(`/aucations/${id}`, { method: "DELETE" });
}

export function removeAllAucations() {
  return apiFetch("/aucations", { method: "DELETE" });
}

export function postBid(id, bid) {
  return apiFetch(`/aucations/${id}/bids`, {
    method: "POST",
    body: { bid },
  });
}

export function removeBid(id) {
  return apiFetch(`/aucations/${id}/bids`, { method: "DELETE" });
}