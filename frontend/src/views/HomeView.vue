<template>
  <div>
    <h1>Mes Tâches</h1>

    <!-- Affichage d'un message de chargement -->
    <div v-if="loading">Chargement des tâches...</div>

    <!-- Affichage d'un message d'erreur si nécessaire -->
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- Affichage des tâches en grille -->
    <div v-else class="tasks-grid">
      <TaskCard
        v-for="task in tasks"
        :key="task._id"
        :task="task"
        class="task-item"
        @click="openModal(task._id)" />
    </div>

    <!-- Modal des détails -->
    <TaskModal :show="showModal" :taskId="selectedTaskId" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TaskCard from "@/components/TaskCard.vue";
import TaskModal from "@/components/TaskModal.vue";

// États réactifs
const tasks = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const selectedTaskId = ref(null);

// Fonction pour récupérer les tâches
const fetchTasks = async () => {
  try {
    loading.value = true;
    const response = await fetch("http://localhost:3000/api/tasks");
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des tâches");
    }
    const data = await response.json();
    tasks.value = data;
  } catch (err) {
    error.value = "Impossible de charger les tâches : " + err.message;
    console.error("Erreur:", err);
  } finally {
    loading.value = false;
  }
};

// Fonctions pour le modal
const openModal = (taskId) => {
  selectedTaskId.value = taskId;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedTaskId.value = null;
};

// Charger les tâches au montage du composant
onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
h1 {
  color: var(--text-color);
  margin-bottom: 24px;
}

.error {
  color: #dc3545;
  padding: 1rem;
  border-radius: 4px;
  background-color: #f8d7da;
  margin-bottom: 1rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* Responsive design */
@media (max-width: 1200px) {
  .tasks-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .tasks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
