<script setup lang="ts">
import { Toaster as SonnerPrimitive } from "vue-sonner";
import "vue-sonner/style.css";

import "@/components/ui/sonner/sonner.css";
</script>

<template>
  <SonnerPrimitive
    class="ui-sonner"
    :expand="true"
    :visible-toasts="6"
    position="bottom-right"
    :rich-colors="true"
    close-button
  />
</template>
