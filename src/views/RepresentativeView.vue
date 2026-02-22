<template>
  <div class="rep-container">
    <p v-if="loading" class="info">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <form
      v-if="!loading && !error && (!registration || editing)"
      class="rep-form"
      @submit.prevent="submitForm"
    >
      <h2>{{ editing ? 'Edit registration' : 'Create company registration' }}</h2>

      <label>
        Company name
        <input v-model="form.name" required />
      </label>

      <label>
        Contact e-mail
        <input type="email" v-model="form.email" required />
      </label>

      <label>
        Goal / purpose
        <div class="goal-field-wrap">
          <textarea
            ref="goalFieldRef"
            v-model="form.goal"
            rows="1"
            maxlength="600"
            class="goal-field"
            required
            @input="resizeGoalField"
          ></textarea>
          <span class="goal-meta">{{ form.goal.length }}/600</span>
        </div>
      </label>

      <label>
        Articles of Association
        <span class="file-hint">Upload one or more files (PDF, DOC, DOCX, PNG, JPG).</span>

        <div v-if="existingFiles.length" class="existing-files">
          <div v-for="file in existingFiles" :key="file.id" class="file-row">
            <span class="file-name">{{ file.originalFilename }}</span>
            <button
              v-if="registration?.state !== 'ACCEPTED'"
              type="button"
              class="exec-inline-btn remove-btn"
              @click="removeExistingFile(file.id)"
            >
              -
            </button>
          </div>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          @change="onFilesSelected"
        />
        <div v-if="pendingFiles.length" class="pending-files">
          <div v-for="(file, idx) in pendingFiles" :key="idx" class="file-row">
            <span class="file-name">{{ file.name }}</span>
            <button type="button" class="exec-inline-btn remove-btn" @click="removePendingFile(idx)">
              -
            </button>
          </div>
        </div>

        <p v-if="!existingFiles.length && !pendingFiles.length" class="file-hint file-required">
          At least one file is required.
        </p>
      </label>

      <label>
        Headquarters
        <input v-model="form.hq" required />
      </label>

      <label>
        Executives (optional)
        <span class="exec-hint">A new row appears automatically when you fill the last one.</span>
        <div class="execs-field">
          <div
            v-for="(executive, index) in form.executives"
            :key="`exec-${index}`"
            class="exec-row"
          >
            <div class="exec-input-wrap">
              <input
                v-model="form.executives[index]"
                :placeholder="`Executive ${index + 1} full name`"
                @input="onExecutiveInput(index)"
                @blur="cleanupExecutiveRows"
              />

              <button
                v-if="!(index === form.executives.length - 1 && !executive.trim())"
                type="button"
                class="exec-inline-btn remove-btn"
                :aria-label="`Remove executive row ${index + 1}`"
                @click="removeExecutive(index)"
              >
                -
              </button>
            </div>
          </div>
        </div>
      </label>

      <div class="btn-row">
        <button type="submit" :disabled="saving || (!existingFiles.length && !pendingFiles.length)">
          {{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Submit') }}
        </button>
        <button
          v-if="editing"
          type="button"
          class="secondary-btn"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </form>

    <div v-else-if="registration" class="rep-details">
      <div :class="['status-banner', statusClass]">
        {{ registration.state }}
      </div>

      <div v-if="registration.state !== 'ACCEPTED'" class="details-actions">
        <button class="edit-btn" @click="startEdit">
          Edit
        </button>
        <button
          type="button"
          class="delete-btn"
          :disabled="deleting"
          @click="deleteRegistration"
        >
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>

      <h2>Your registration</h2>
      <p><strong>Name:</strong> {{ registration.name }}</p>
      <p><strong>Email:</strong> {{ registration.email }}</p>
      <p v-if="registration.taxId"><strong>Tax ID:</strong> {{ registration.taxId }}</p>
      <p><strong>Headquarters:</strong> {{ registration.hq }}</p>
      <p><strong>Executives:</strong> {{ registration.executives }}</p>
      <p><strong>Goal:</strong> {{ registration.goal }}</p>
      <div>
        <strong>Articles of Association:</strong>
        <div v-if="registration.articleDocuments && registration.articleDocuments.length" class="doc-list">
          <a
            v-for="doc in registration.articleDocuments"
            :key="doc.id"
            :href="`${apiBase}/api/registration/files/${doc.id}`"
            target="_blank"
            rel="noopener"
            class="doc-link"
            @click.prevent="downloadRepFile(doc.id, doc.originalFilename)"
          >
            {{ doc.originalFilename }}
          </a>
        </div>
        <span v-else>-</span>
      </div>
      <p><strong>Submitted at:</strong> {{ formatDate(registration.timestamp) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';

const { keycloak } = useKeycloak();
const apiBase = import.meta.env.VITE_API_BASE;

const loading = ref(false);
const error = ref(null);
const registration = ref(null);
const saving = ref(false);
const deleting = ref(false);
const editing = ref(false);
const goalFieldRef = ref(null);
const fileInputRef = ref(null);

const pendingFiles = ref([]);
const existingFiles = ref([]);

const form = ref(createEmptyForm());

onMounted(async () => {
  await fetchRegistration();
  nextTick(resizeGoalField);
});

function createEmptyForm() {
  return {
    id: undefined,
    name: '',
    email: '',
    goal: '',
    hq: '',
    executives: [''],
  };
}

async function fetchRegistration() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${apiBase}/api/registration`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 204) {
      registration.value = null;
      form.value = createEmptyForm();
    } else if (res.ok) {
      registration.value = await res.json();
    } else {
      throw new Error(`Request failed: ${res.status}`);
    }
  } catch (e) {
    error.value = e.message ?? 'Unknown error';
  } finally {
    loading.value = false;
  }
}

function startEdit() {
  if (!registration.value) return;
  editing.value = true;

  form.value = {
    ...registration.value,
    goal: registration.value.goal || '',
    executives: executivesFromApi(registration.value.executives),
  };

  existingFiles.value = [...(registration.value.articleDocuments || [])];
  pendingFiles.value = [];

  nextTick(resizeGoalField);
}

function cancelEdit() {
  editing.value = false;
  pendingFiles.value = [];
  existingFiles.value = [];
}

function onFilesSelected(event) {
  const files = Array.from(event.target.files || []);
  pendingFiles.value.push(...files);
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function removePendingFile(index) {
  pendingFiles.value.splice(index, 1);
}

async function removeExistingFile(fileId) {
  try {
    const res = await fetch(`${apiBase}/api/registration/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
    existingFiles.value = existingFiles.value.filter((f) => f.id !== fileId);
  } catch (e) {
    error.value = e.message ?? 'Failed to remove file';
  }
}

async function uploadPendingFiles() {
  if (!pendingFiles.value.length) return;

  const formData = new FormData();
  for (const file of pendingFiles.value) {
    formData.append('files', file);
  }

  const res = await fetch(`${apiBase}/api/registration/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${keycloak.token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
  pendingFiles.value = [];
}

async function submitForm() {
  if (saving.value) return;

  if (!existingFiles.value.length && !pendingFiles.value.length) {
    error.value = 'At least one Articles of Association file is required.';
    return;
  }

  error.value = null;
  saving.value = true;

  const executiveList = normalizeExecutives(form.value.executives);

  const method = editing.value ? 'PUT' : 'POST';
  const payload = {
    ...form.value,
    executives: executiveList.join(','),
  };

  try {
    const res = await fetch(`${apiBase}/api/registration`, {
      method,
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (![200, 201, 202, 204].includes(res.status)) {
      throw new Error(`Server responded ${res.status}`);
    }

    await uploadPendingFiles();
    await fetchRegistration();
  } catch (e) {
    error.value = e.message ?? 'Submission failed';
  } finally {
    saving.value = false;
    editing.value = false;
  }
}

async function deleteRegistration() {
  if (!registration.value || deleting.value) return;

  const confirmed = window.confirm('Delete your registration and all uploaded files? This cannot be undone.');
  if (!confirmed) return;

  error.value = null;
  deleting.value = true;

  try {
    const res = await fetch(`${apiBase}/api/registration`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });

    if (![200, 202, 204].includes(res.status)) {
      throw new Error(`Delete failed: ${res.status}`);
    }

    registration.value = null;
    form.value = createEmptyForm();
    existingFiles.value = [];
    pendingFiles.value = [];
    editing.value = false;
  } catch (e) {
    error.value = e.message ?? 'Failed to delete registration';
  } finally {
    deleting.value = false;
  }
}

async function downloadRepFile(fileId, filename) {
  try {
    const res = await fetch(`${apiBase}/api/registration/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    error.value = e.message ?? 'Download failed';
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function resizeGoalField() {
  const el = goalFieldRef.value;
  if (!el) return;

  el.style.height = 'auto';
  const maxHeight = 180;
  const nextHeight = Math.min(el.scrollHeight, maxHeight);
  el.style.height = `${nextHeight}px`;
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function onExecutiveInput(index) {
  const values = form.value.executives;
  if (index !== values.length - 1) return;

  if (values[index].trim()) {
    values.push('');
  }
}

function removeExecutive(index) {
  form.value.executives.splice(index, 1);
  if (!form.value.executives.length) {
    form.value.executives.push('');
  }

  cleanupExecutiveRows();
}

function cleanupExecutiveRows() {
  const values = form.value.executives;
  const cleaned = values.filter((value, idx) => value.trim() || idx === values.length - 1);

  if (!cleaned.length || cleaned[cleaned.length - 1].trim()) {
    cleaned.push('');
  }

  form.value.executives = cleaned;
}

function executivesFromApi(value) {
  if (!value) return [''];

  const list = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  return list.length ? [...list, ''] : [''];
}

function normalizeExecutives(values) {
  if (!Array.isArray(values)) return [];

  return values
    .map((v) => v.trim())
    .filter(Boolean);
}

const statusClass = computed(() => {
  switch ((registration.value?.state || '').toUpperCase()) {
    case 'ACCEPTED':
      return 'status-accepted';
    case 'DENIED':
      return 'status-denied';
    default:
      return 'status-pending';
  }
});
</script>

<style src="./RepresentativeView.css" scoped></style>
