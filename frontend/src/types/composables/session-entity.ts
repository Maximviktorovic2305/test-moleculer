export type SessionInitializeOptions = {
  bootstrap: () => Promise<void>;
  resetWorkspace: () => void;
};

export type SessionSubmitOptions = {
  loadWorkspace: () => Promise<void>;
};

export type SessionLogoutOptions = {
  resetWorkspace: () => void;
};
