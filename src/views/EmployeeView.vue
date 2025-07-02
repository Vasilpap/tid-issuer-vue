<template>
  <div class="p-6 space-y-6">
    <!-- States -->
    <div v-if="loading" class="text-gray-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- Accordion List -->
    <div v-else>
      <div v-if="items.length === 0" class="text-gray-500">Nothing to process 🎉</div>

      <div
        v-for="item in items"
        :key="item.id"
        class="rounded border shadow-sm"
      >
        <details class="group">
          <summary
            class="flex cursor-pointer select-none items-center justify-between gap-2 bg-gray-100 px-4 py-3 text-lg font-medium hover:bg-gray-200 group-open:bg-gray-200"
          >
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

onMounted(load);
</script>

<style scoped>
/* Hide native arrow for Chrome */
details > summary::-webkit-details-marker {
  display: none;
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
