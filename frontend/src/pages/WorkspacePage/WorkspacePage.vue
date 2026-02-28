<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import AppHeader from "@/components/app/AppHeader/AppHeader.vue";
import NoteEditor from "@/components/notes/NoteEditor/NoteEditor.vue";
import NotesSidebar from "@/components/notes/NotesSidebar/NotesSidebar.vue";
import { useNotesApp } from "@/composables/useNotesApp";
import { notifyError } from "@/composables/useNotifications";

import "@/pages/WorkspacePage/WorkspacePage.css";

const router = useRouter();
const {
  user,
  notes,
  categories,
  search,
  filterCategoryId,
  selectedNoteId,
  noteForm,
  categoryDraft,
  busy,
  bootstrapData,
  logout,
  createNewNote,
  openNote,
  applyCategoryFilter,
  saveNote,
  removeNote,
  addCategory,
  removeCategory,
} = useNotesApp();

onMounted(() => {
  bootstrapData().catch((error) => {
    console.error("Workspace bootstrap error", error);
    notifyError("Не удалось загрузить рабочее пространство. Подробности в консоли.");
  });
});

const handleLogout = async () => {
  await logout();
  await router.replace({ name: "auth" });
};
</script>

<template>
  <div class="workspace-page">
    <div class="workspace-page__container">
      <AppHeader :user="user" @logout="handleLogout" />

      <section class="workspace-page__content">
        <NotesSidebar
          :notes="notes"
          :categories="categories"
          :loading="busy.notes || busy.bootstrap"
          :selected-note-id="selectedNoteId"
          :search="search"
          :filter-category-id="filterCategoryId"
          @create="createNewNote"
          @select="openNote"
          @update:search="search = $event"
          @update:filter-category-id="applyCategoryFilter"
        />

        <NoteEditor
          :note-form="noteForm"
          :categories="categories"
          :selected-note-id="selectedNoteId"
          :saving="busy.saveNote"
          :category-draft="categoryDraft"
          :category-busy="busy.saveCategory"
          @save="saveNote"
          @delete="removeNote"
          @update:category-draft="categoryDraft = $event"
          @add-category="addCategory"
          @remove-category="removeCategory"
        />
      </section>
    </div>
  </div>
</template>
