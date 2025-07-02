<template>
  <div class="rep-container">
    <!-- Loading / error states -->
    <p v-if="loading" class="info">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- No registration yet → show form -->
    <form v-if="!loading && !error && !registration" class="rep-form" @submit.prevent="submitForm">
      <h2>Create company registration</h2>

      <label>
        Company name
        <input v-model="form.name" required />
      </label>

      <label>
        Contact e‑mail
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
        Executives (comma‑separated)
        <input v-model="form.executives" required />
      </label>

      <button type="submit" :disabled="saving">Submit</button>
    </form>

    <!-- Existing registration → read‑only details -->
    <div v-else-if="registration" class="rep-details">
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
import { ref, onMounted } from 'vue';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';

const { keycloak } = useKeycloak();

const loading = ref(false);
const error = ref(null);
const registration = ref(null);

const form = ref({
  name: '',
  email: '',
  goal: '',
  articlesOfAssociation: '',
  hq: '',
  executives: '',
});

const saving = ref(false);

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
      registration.value = null; // no content → show form
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

async function submitForm() {
  if (saving.value) return;
  saving.value = true;
  error.value = null;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/registration`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);

    registration.value = await res.json(); // server returns created object
  } catch (e) {
    error.value = e.message ?? 'Submission failed';
  } finally {
    saving.value = false;
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}
</script>

<style scoped>
.rep-container {
  max-width: 620px;
  margin: 0 auto;
}

.info {
  color: #4b5563; /* gray‑600 */
}

.error {
  color: #dc2626; /* red‑600 */
}

/* ---------- form ---------- */
.rep-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #fff;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.rep-form h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.rep-form label {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  gap: 0.25rem;
}

.rep-form input,
.rep-form textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.rep-form button[type="submit"] {
  align-self: flex-start;
  background: #2563eb; /* blue‑600 */
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.rep-form button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ---------- details ---------- */
.rep-details {
  background: #fff;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  line-height: 1.4;
}

.rep-details h2 {
  margin-top: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.rep-details p {
  margin: 0.25rem 0;
}
</style>
