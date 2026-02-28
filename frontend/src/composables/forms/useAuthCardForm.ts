import { computed, watch, type Ref } from "vue";
import { useForm } from "vee-validate";

import { loginFormVeeSchema, registerFormVeeSchema } from "@/utils/validation/vee-schemas";
import type { AuthFormState } from "@/types";
import type { AuthFormErrors } from "@/types/forms";
import type { UseAuthCardFormOptions } from "@/types/composables";

export const useAuthCardForm = (options: UseAuthCardFormOptions) => {
  const validationSchema = computed(() => {
    if (options.mode.value === "register") {
      return registerFormVeeSchema;
    }

    return loginFormVeeSchema;
  });

  const { defineField, errors, handleSubmit, resetForm } = useForm<AuthFormState>({
    validationSchema,
    initialValues: {
      name: options.form.name,
      email: options.form.email,
      password: options.form.password,
    },
    validateOnMount: false,
  });

  const [nameField] = defineField("name", {
    validateOnModelUpdate: false,
  });
  const [emailField] = defineField("email", {
    validateOnModelUpdate: false,
  });
  const [passwordField] = defineField("password", {
    validateOnModelUpdate: false,
  });

  watch(
    () => [options.form.name, options.form.email, options.form.password],
    ([nextName, nextEmail, nextPassword]) => {
      if (nameField.value !== nextName) {
        nameField.value = nextName ?? "";
      }

      if (emailField.value !== nextEmail) {
        emailField.value = nextEmail ?? "";
      }

      if (passwordField.value !== nextPassword) {
        passwordField.value = nextPassword ?? "";
      }
    },
  );

  watch([nameField, emailField, passwordField], ([nextName, nextEmail, nextPassword]) => {
    options.form.name = nextName ?? "";
    options.form.email = nextEmail ?? "";
    options.form.password = nextPassword ?? "";
  });

  watch(
    () => options.mode.value,
    () => {
      resetForm({
        values: {
          name: options.form.name,
          email: options.form.email,
          password: options.form.password,
        },
      });
    },
  );

  const canSubmit = computed(() => {
    const hasEmail = String(emailField.value ?? "").trim().length > 0;
    const hasPassword = String(passwordField.value ?? "").trim().length > 0;
    const hasName = String(nameField.value ?? "").trim().length > 0;

    if (options.mode.value === "register") {
      return hasName && hasEmail && hasPassword;
    }

    return hasEmail && hasPassword;
  });

  const onSubmit = handleSubmit(() => {
    options.onSubmit();
  });

  return {
    nameField,
    emailField,
    passwordField,
    errors: errors as Ref<AuthFormErrors>,
    canSubmit,
    onSubmit,
  };
};
