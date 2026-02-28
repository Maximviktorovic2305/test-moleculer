import type { Note } from "@/types";

import { request } from "@/services/base";

export const notesService = {
  list(token: string, query: { search?: string; categoryId?: number | null }) {
    const params = new URLSearchParams();

    if (query.search?.trim()) {
      params.set("search", query.search.trim());
    }

    if (query.categoryId) {
      params.set("categoryId", String(query.categoryId));
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<Note[]>(`/notes${suffix}`, { method: "GET" }, token);
  },

  get(token: string, id: number) {
    return request<Note>(`/notes/${id}`, { method: "GET" }, token);
  },

  create(token: string, data: { title: string; content: string; categoryId: number | null }) {
    return request<Note>(
      "/notes",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    );
  },

  update(
    token: string,
    id: number,
    data: { title?: string; content?: string; categoryId?: number | null },
  ) {
    return request<Note>(
      `/notes/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      token,
    );
  },

  remove(token: string, id: number) {
    return request<{ success: boolean }>(`/notes/${id}`, { method: "DELETE" }, token);
  },
};
