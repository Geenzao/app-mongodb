<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ task.titre }}</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <div v-if="loading" class="modal-loading">Chargement des détails...</div>
      <div v-else-if="error" class="modal-error">
        {{ error }}
      </div>
      <div v-else class="modal-body">
        <div class="task-status-priority">
          <div class="status-priority-container">
            <span class="task-priority" :class="task.priorite">{{
              task.priorite
            }}</span>
            <span class="task-status" :class="task.statut">{{
              task.statut
            }}</span>
          </div>
        </div>

        <div class="task-section">
          <h3>Description</h3>
          <p>{{ task.description || "Aucune description" }}</p>
        </div>

        <div class="task-section">
          <h3>Informations</h3>
          <p>Catégorie: {{ task.categorie }}</p>
          <p>Date d'échéance: {{ formatDate(task.dateEcheance) }}</p>
          <p>Date de création: {{ formatDate(task.dateCreation) }}</p>
        </div>

        <div class="task-section">
          <h3>Étiquettes</h3>
          <div class="task-tags">
            <span v-for="tag in task.etiquettes" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="task-section">
          <h3>Sous-tâches</h3>
          <div v-if="task.sousTaches && task.sousTaches.length > 0">
            <div
              v-for="(sousTask, index) in task.sousTaches"
              :key="index"
              class="sous-tache">
              <span>{{ sousTask.titre }}</span>
              <span :class="{ complete: sousTask.complete }">
                {{ sousTask.complete ? "Terminée" : "En cours" }}
              </span>
            </div>
          </div>
          <p v-else>Aucune sous-tâche</p>
        </div>

        <div class="task-section">
          <h3>Commentaires</h3>
          <div v-if="task.commentaires && task.commentaires.length > 0">
            <div
              v-for="(comment, index) in task.commentaires"
              :key="index"
              class="comment">
              <p>{{ comment.texte }}</p>
              <small>{{ formatDate(comment.date) }}</small>
            </div>
          </div>
          <p v-else>Aucun commentaire</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: Boolean,
  taskId: String,
});

const emit = defineEmits(["close"]);

const task = ref({});
const loading = ref(false);
const error = ref(null);

const closeModal = () => {
  emit("close");
};

const fetchTaskDetails = async () => {
  if (!props.taskId) return;

  try {
    loading.value = true;
    const response = await fetch(
      `http://localhost:3000/api/tasks/${props.taskId}`
    );
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des détails");
    task.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "Non définie";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchTaskDetails();
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}

.task-section {
  margin: 20px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.task-section h3 {
  margin-bottom: 12px;
  color: var(--text-color);
  font-size: 1.1rem;
}

.comment {
  background-color: var(--background-color);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.sous-tache {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.complete {
  color: #10ac84;
}

.status-priority-container {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.task-priority {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.task-priority.haute {
  background-color: #ff4757;
  color: white;
}

.task-priority.moyenne {
  background-color: #ffa502;
  color: white;
}

.task-priority.basse {
  background-color: #7bed9f;
  color: white;
}

.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-status.à\ faire {
  background-color: #ff9f43;
  color: white;
}

.task-status.en\ cours {
  background-color: #54a0ff;
  color: white;
}

.task-status.terminé {
  background-color: #10ac84;
  color: white;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}
</style>
