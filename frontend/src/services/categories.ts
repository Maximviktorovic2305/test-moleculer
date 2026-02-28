import type { Category } from "@/types";

import { request } from "@/services/base";

export const categoriesService = {
  list(token: string) {
    return request<Category[]>("/categories", { method: "GET" }, token);
  },

  create(token: string, data: { name: string }) {
    return request<Category>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    );
  },

  remove(token: string, id: number) {
    return request<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" }, token);
  },
};
