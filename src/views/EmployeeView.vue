<template>
  <section class="employee-page">
    <header class="employee-header">
      <h1>Pending registrations</h1>
      <p>Review submissions and make approval decisions.</p>
    </header>

    <div v-if="loading" class="state state-info">Loading…</div>
    <div v-else-if="error" class="state state-error">{{ error }}</div>

    <div v-else>
      <div v-if="items.length === 0" class="state state-empty">Nothing to process.</div>

      <div
        v-for="item in items"
        :key="item.id"
        class="item-card"
      >
        <details class="group">
          <summary class="item-summary">
            <span>{{ item.name }}</span>
            <span class="item-date">{{ formatDate(item.timestamp) }}</span>
          </summary>

          <div class="item-body">
            <p><strong>Email:</strong> {{ item.email }}</p>
            <p v-if="item.taxId"><strong>Tax&nbsp;ID:</strong> {{ item.taxId }}</p>
            <p><strong>Headquarters:</strong> {{ item.hq }}</p>
            <p><strong>Executives:</strong> {{ item.executives }}</p>
            <p><strong>Goal:</strong> {{ item.goal }}</p>
            <div>
              <strong>Articles of Association:</strong>
              <div v-if="item.articleDocuments && item.articleDocuments.length" class="doc-list">
                <a
                  v-for="doc in item.articleDocuments"
                  :key="doc.id"
                  href="#"
                  class="doc-link"
                  @click.prevent="downloadFile(item.id, doc.id, doc.originalFilename)"
                >
                  {{ doc.originalFilename }}
                </a>
              </div>
              <span v-else>-</span>
            </div>

            <div class="actions-row">
              <button
                class="decision-btn accept"
                :disabled="decisionLoadingId === item.id"
                @click="handleDecision(item.id, 'ACCEPT')"
              >
                Accept
              </button>
              <button
                class="decision-btn deny"
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
  </section>
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

// --- file download -------------------------------------------------------
const downloadFile = async (companyId, fileId, filename) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/processing/${companyId}/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      },
    );
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert(e.message ?? 'Download failed');
  }
};

// --- utils ---------------------------------------------------------------
function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

onMounted(load);
</script>

<style scoped>
.employee-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.employee-header h1 {
  font-size: 1.65rem;
  line-height: 1.15;
  color: #173748;
}

.employee-header p {
  margin-top: 0.35rem;
  color: var(--muted);
}

.state {
  padding: 0.9rem 1rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--bg-soft);
}

.state-error {
  border-color: #e9b6b5;
  color: #8d2e2d;
  background: #fff3f2;
}

.state-empty {
  color: var(--muted);
}

.item-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.85rem;
  box-shadow: var(--shadow-soft);
  background: var(--surface);
}

details > summary::-webkit-details-marker {
  display: none;
}

.item-summary {
  display: flex;
  cursor: pointer;
  user-select: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  font-size: 1.03rem;
  font-weight: 700;
  background: var(--surface-alt);
}

.item-date {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}

.item-body {
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
  font-size: 0.95rem;
}

.item-body p {
  line-height: 1.45;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.doc-link {
  color: var(--brand);
  font-weight: 600;
}

.actions-row {
  padding-top: 0.65rem;
  display: flex;
  gap: 0.55rem;
}

.decision-btn {
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.decision-btn:hover {
  transform: translateY(-1px);
  filter: brightness(0.95);
}

.accept {
  background: var(--success);
}

.deny {
  background: var(--danger);
}

.decision-btn:disabled {
  opacity: 0.55;
  cursor: wait;
}

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

@media (max-width: 620px) {
  .item-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
