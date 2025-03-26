<template>
  <div>
    <div class="header-container">
      <h1>Mes Tâches</h1>
      <button class="add-task-button" @click="openCreateModal">
        + Nouvelle tâche
      </button>
    </div>

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
    <TaskModal
      :show="showModal"
      :taskId="selectedTaskId"
      @close="closeModal"
      @taskDeleted="onTaskDeleted" />

    <!-- Modal de création -->
    <CreateTaskModal
      :show="showCreateModal"
      @close="closeCreateModal"
      @taskCreated="onTaskCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TaskCard from "@/components/TaskCard.vue";
import TaskModal from "@/components/TaskModal.vue";
import CreateTaskModal from "@/components/CreateTaskModal.vue";

// États réactifs
const tasks = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const selectedTaskId = ref(null);
const showCreateModal = ref(false);

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

const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const onTaskCreated = async (newTask) => {
  await fetchTasks(); // Recharger toutes les tâches
};

// Fonction pour gérer la suppression d'une tâche
const onTaskDeleted = async () => {
  await fetchTasks(); // Recharger la liste des tâches
  closeModal();
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

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-task-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.add-task-button:hover {
  background-color: var(--secondary-color);
}
</style>
