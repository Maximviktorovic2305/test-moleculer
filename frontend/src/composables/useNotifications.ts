import { toast } from "vue-sonner";

export const notifySuccess = (message: string) => {
  toast.success(message, {
    duration: 3500,
  });
};

export const notifyInfo = (message: string) => {
  toast(message, {
    duration: 3500,
  });
};

export const notifyError = (message: string) => {
  toast.error(message, {
    duration: 5000,
  });
};
