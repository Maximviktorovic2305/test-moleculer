import type { Category } from "@/types";
import type { AuthorizedRequest, RequestErrorHandler } from "@/types/composables/request";

export type AddCategoryOptions = {
  withAuthorizedRequest: AuthorizedRequest;
  onError: RequestErrorHandler;
};

export type RemoveCategoryOptions = {
  category: Category;
  withAuthorizedRequest: AuthorizedRequest;
  onError: RequestErrorHandler;
  onAfterRemove?: (category: Category) => Promise<void> | void;
};
