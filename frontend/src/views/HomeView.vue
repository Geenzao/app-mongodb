<template>
  <div>
    <div class="header-container">
      <h1>Mes Tâches</h1>
      <button class="add-task-button" @click="openCreateModal">
        + Nouvelle tâche
      </button>
    </div>

    <!-- Formulaire de filtres -->
    <div class="filters-container">
      <form @submit.prevent="applyFilters">
        <div class="filter-row">
          <div class="filter-group">
            <label for="statut">Statut</label>
            <select id="statut" v-model="filters.statut">
              <option value="">Tous</option>
              <option value="à faire">À faire</option>
              <option value="en cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="annulée">Annulée</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="priorite">Priorité</label>
            <select id="priorite" v-model="filters.priorite">
              <option value="">Toutes</option>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="categorie">Catégorie</label>
            <input
              type="text"
              id="categorie"
              v-model="filters.categorie"
              placeholder="Entrez une catégorie" />
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label for="sortBy">Trier par</label>
            <select id="sortBy" v-model="filters.sortBy">
              <option value="">Par défaut</option>
              <option value="dateCreation:desc">
                Date de création (récent)
              </option>
              <option value="dateCreation:asc">
                Date de création (ancien)
              </option>
              <option value="dateEcheance:asc">Date d'échéance (proche)</option>
              <option value="dateEcheance:desc">
                Date d'échéance (lointain)
              </option>
            </select>
          </div>

          <button type="submit" class="filter-button">
            Appliquer les filtres
          </button>
          <button
            type="button"
            class="filter-button reset"
            @click="resetFilters">
            Réinitialiser
          </button>
        </div>
      </form>
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

const filters = ref({
  statut: "",
  priorite: "",
  categorie: "",
  sortBy: "",
});

const applyFilters = () => {
  fetchTasks(filters.value);
};

// Fonction pour récupérer les tâches
const fetchTasks = async (filters = {}) => {
  try {
    loading.value = true;

    // Construction des paramètres de requête
    const queryParams = new URLSearchParams();

    // Ajout des filtres
    if (filters.statut) queryParams.append("statut", filters.statut);
    if (filters.priorite) queryParams.append("priorite", filters.priorite);
    if (filters.categorie) queryParams.append("categorie", filters.categorie);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);

    const url = `http://localhost:3000/api/tasks?${queryParams.toString()}`;
    const response = await fetch(url);

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

// Exemples d'utilisation :
// Pour filtrer par statut et trier par date de création
fetchTasks({ statut: "en cours", sortBy: "dateCreation:desc" });

// Pour filtrer par priorité et trier par date d'échéance
fetchTasks({ priorite: "haute", sortBy: "dateEcheance:asc" });

// Pour filtrer par statut, priorité et catégorie
fetchTasks({ statut: "en cours", priorite: "basse", categorie: "perso" });

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

const resetFilters = () => {
  filters.value = {
    statut: "",
    priorite: "",
    categorie: "",
    sortBy: "",
  };
  applyFilters();
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

.filters-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.filter-button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.filter-button.reset {
  background-color: #6c757d;
}

.filter-button:hover {
  background-color: var(--secondary-color);
}

.filter-button.reset:hover {
  background-color: #5a6268;
}
</style>
