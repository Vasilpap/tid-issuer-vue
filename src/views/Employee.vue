<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <header class="flex items-center gap-4">
      <h1 class="text-2xl font-semibold">Pending company registrations</h1>
      <button
        class="ml-auto inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        @click="logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="h-4 w-4"
        >
          <path
            fill-rule="evenodd"
            d="M12.75 3.75a.75.75 0 0 1 .75-.75h4.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4.5a.75.75 0 0 1 0-1.5h4.5A1.5 1.5 0 0 0 21 18V6a1.5 1.5 0 0 0-1.5-1.5h-4.5a.75.75 0 0 1-.75-.75zM15.03 8.47a.75.75 0 0 1 0 1.06L13.56 11H4.75a.75.75 0 0 1 0-1.5h8.81l1.47-1.47a.75.75 0 0 1 1.06 0zm-1.47 6.06 1.47 1.47a.75.75 0 1 1-1.06 1.06l-1.47-1.47H4.75a.75.75 0 0 1 0-1.5h8.81z"
            clip-rule="evenodd"
          />
        </svg>
        Logout
      </button>
    </header>

    <!-- States -->
    <div v-if="loading" class="text-gray-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Accordion List -->
    <div v-else>
      <div v-if="items.length === 0" class="text-gray-500">Nothing to process 🎉</div>

      <div
        v-for="item in items"
        :key="item.id"
        class="rounded border shadow-sm">
        <details class="group">
          <summary
            class="flex cursor-pointer select-none items-center justify-between gap-2 bg-gray-100 px-4 py-3 text-lg font-medium hover:bg-gray-200 group-open:bg-gray-200">
            <span>{{ item.name }}</span>
            <span class="text-sm text-gray-500">{{ formatDate(item.timestamp) }}</span>
          </summary>

          <div class="space-y-1 bg-white px-4 py-3 text-sm">
            <p><strong>Email:</strong> {{ item.email }}</p>
            <p v-if="item.taxId"><strong>Tax&nbsp;ID:</strong> {{ item.taxId }}</p>
            <p><strong>Headquarters:</strong> {{ item.hq }}</p>
            <p><strong>Executives:</strong> {{ item.executives }}</p>
            <p><strong>Goal:</strong> {{ item.goal }}</p>
            <p>
              <strong>Articles of Association:</strong>
              <a
                :href="item.articlesOfAssociation"
                target="_blank"
                rel="noopener"
                class="text-blue-600 underline"
              >
                download
              </a>
            </p>

            <!-- Decision buttons -->
            <div class="pt-3">
              <button
                class="mr-2 inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 font-medium text-white shadow transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                :disabled="decisionLoadingId === item.id"
                @click="handleDecision(item.id, 'ACCEPT')"
              >
                Accept
              </button>
              <button
                class="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 font-medium text-white shadow transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                :disabled="decisionLoadingId === item.id"
                @click="handleDecision(item.id, 'DENY')"
              >
                Deny
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useKeycloak } from '@dsb-norge/vue-keycloak-js';

const { keycloak } = useKeycloak();

const items = ref([]);
const loading = ref(false);
const error = ref(null);
const decisionLoadingId = ref(null);

// --- data loading --------------------------------------------------------
const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/processing`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    items.value = await res.json();
  } catch (e) {
    error.value = e.message ?? 'Unknown error';
  } finally {
    loading.value = false;
  }
};

// --- accept / deny -------------------------------------------------------
const handleDecision = async (companyId, decision) => {
  decisionLoadingId.value = companyId;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/processing`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyId, decision }),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);

    // optimistic: remove item locally
    items.value = items.value.filter((it) => it.id !== companyId);
  } catch (e) {
    alert(e.message ?? 'Request failed');
  } finally {
    decisionLoadingId.value = null;
  }
};

// --- utils ---------------------------------------------------------------
function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

// --- logout --------------------------------------------------------------
function logout() {
  keycloak.logout({ redirectUri: window.location.origin });
}

onMounted(load);
</script>

<style scoped>
details > summary::-webkit-details-marker {
  display: none; /* hide default arrow in Chrome */
}

/* subtle open/close animation */
@keyframes sweep {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.group[open] > summary + div {
  animation: sweep 0.15s ease-out;
}
</style>
