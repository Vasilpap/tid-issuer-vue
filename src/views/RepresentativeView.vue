<template>
  <div class="rep-container">
    <!-- Loading & error messages -->
    <p v-if="loading" class="info">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Create / Edit form -->
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
        <textarea v-model="form.goal" rows="2" required></textarea>
      </label>

      <label>
        Articles of Association (URL)
        <input type="url" v-model="form.articlesOfAssociation" required />
      </label>

      <label>
        Headquarters
        <input v-model="form.hq" required />
      </label>

      <label>
        Executives (comma-separated)
        <input v-model="form.executives" required />
      </label>

      <div class="btn-row">
        <button type="submit" :disabled="saving">
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

    <!-- Read-only card -->
    <div v-else-if="registration" class="rep-details">
      <div :class="['status-banner', statusClass]">
        {{ registration.state }}
      </div>

      <button
        v-if="registration.state !== 'ACCEPTED' && !editing"
        class="edit-btn"
        @click="startEdit"
      >
        Edit
      </button>

      <h2>Your registration</h2>
      <p><strong>Name:</strong> {{ registration.name }}</p>
      <p><strong>Email:</strong> {{ registration.email }}</p>
      <p v-if="registration.taxId"><strong>Tax ID:</strong> {{ registration.taxId }}</p>
      <p><strong>Headquarters:</strong> {{ registration.hq }}</p>
      <p><strong>Executives:</strong> {{ registration.executives }}</p>
      <p><strong>Goal:</strong> {{ registration.goal }}</p>
      <p>
        <strong>Articles of Association:</strong>
        <a :href="registration.articlesOfAssociation" target="_blank" rel="noopener">download</a>
      </p>
      <p><strong>Submitted at:</strong> {{ formatDate(registration.timestamp) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';

const { keycloak } = useKeycloak();

const loading = ref(false);
const error = ref(null);
const registration = ref(null);
const saving = ref(false);
const editing = ref(false);

const form = ref({
  id: undefined,
  name: '',
  email: '',
  goal: '',
  articlesOfAssociation: '',
  hq: '',
  executives: '',
});

onMounted(fetchRegistration);

async function fetchRegistration() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/registration`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 204) {
      registration.value = null;
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
  form.value = { ...registration.value };
}

function cancelEdit() {
  editing.value = false;
}

async function submitForm() {
  if (saving.value) return;
  saving.value = true;
  error.value = null;

  const method = editing.value ? 'PUT' : 'POST';
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/registration`, {
      method,
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    });

    if ([201, 202, 204].includes(res.status)) {
      await fetchRegistration();
    } else if (res.ok) {
      const text = await res.text();
      registration.value = text ? JSON.parse(text) : null;
      if (!registration.value) await fetchRegistration();
    } else {
      throw new Error(`Server responded ${res.status}`);
    }
  } catch (e) {
    error.value = e.message ?? 'Submission failed';
  } finally {
    saving.value = false;
    editing.value = false;
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
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
