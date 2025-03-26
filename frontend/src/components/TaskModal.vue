<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ task.titre }}</h2>
        <div class="modal-actions">
          <button class="delete-button" @click="confirmDelete">
            Supprimer
          </button>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
      </div>

      <div v-if="loading" class="modal-loading">Chargement des détails...</div>
      <div v-else-if="error" class="modal-error">
        {{ error }}
      </div>
      <div v-else class="modal-body">
        <div class="task-section">
          <h3>Auteur</h3>
          <div class="author-info">
            <div class="author-name">
              <p>
                <strong>{{ task.auteur.prenom }} {{ task.auteur.nom }}</strong>
              </p>
            </div>
            <p class="author-email">
              <a :href="'mailto:' + task.auteur.email">{{
                task.auteur.email
              }}</a>
            </p>
          </div>
        </div>

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
          <div class="section-header">
            <h3>Sous-tâches</h3>
            <button class="add-button" @click="showAddSubTask = true">
              + Ajouter
            </button>
          </div>

          <!-- Formulaire d'ajout de sous-tâche -->
          <div v-if="showAddSubTask" class="add-form">
            <input
              v-model="newSubTask.titre"
              placeholder="Titre de la sous-tâche"
              class="form-input" />
            <div class="form-actions">
              <button class="button-submit" @click="addSubTask">Ajouter</button>
              <button class="button-cancel" @click="showAddSubTask = false">
                Annuler
              </button>
            </div>
          </div>

          <!-- Liste des sous-tâches -->
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
          <div class="section-header">
            <h3>Commentaires</h3>
            <button class="add-button" @click="showAddComment = true">
              + Ajouter
            </button>
          </div>

          <!-- Formulaire d'ajout de commentaire -->
          <div v-if="showAddComment" class="add-form">
            <div class="author-inputs">
              <input
                v-model="newComment.auteur.nom"
                placeholder="Nom"
                class="form-input" />
              <input
                v-model="newComment.auteur.prenom"
                placeholder="Prénom"
                class="form-input" />
              <input
                v-model="newComment.auteur.email"
                placeholder="Email"
                class="form-input"
                type="email" />
            </div>
            <textarea
              v-model="newComment.contenu"
              placeholder="Votre commentaire"
              class="form-input"></textarea>
            <div class="form-actions">
              <button class="button-submit" @click="addComment">Ajouter</button>
              <button class="button-cancel" @click="showAddComment = false">
                Annuler
              </button>
            </div>
          </div>

          <!-- Liste des commentaires -->
          <div v-if="task.commentaires && task.commentaires.length > 0">
            <div
              v-for="(comment, index) in task.commentaires"
              :key="index"
              class="comment">
              <div class="comment-header">
                <strong
                  >{{ comment.auteur.prenom }} {{ comment.auteur.nom }}</strong
                >
                <small>{{ formatDate(comment.date) }}</small>
              </div>
              <p>{{ comment.contenu }}</p>
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

const emit = defineEmits(["close", "taskDeleted"]);

const task = ref({});
const loading = ref(false);
const error = ref(null);

// États pour les formulaires
const showAddSubTask = ref(false);
const showAddComment = ref(false);
const newSubTask = ref({ titre: "" });
const newComment = ref({
  auteur: {
    nom: "",
    prenom: "",
    email: "",
  },
  contenu: "",
});

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

const confirmDelete = async () => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${props.taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la tâche");
      }

      emit("taskDeleted");
      closeModal();
    } catch (err) {
      error.value = err.message;
    }
  }
};

// Fonction pour ajouter une sous-tâche
const addSubTask = async () => {
  try {
    if (!newSubTask.value.titre.trim()) return;

    const response = await fetch(
      `http://localhost:3000/api/tasks/${props.taskId}/subtasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubTask.value),
      }
    );

    if (!response.ok)
      throw new Error("Erreur lors de l'ajout de la sous-tâche");

    // Rafraîchir les détails de la tâche
    await fetchTaskDetails();
    showAddSubTask.value = false;
    newSubTask.value.titre = "";
  } catch (err) {
    error.value = err.message;
  }
};

// Fonction pour ajouter un commentaire
const addComment = async () => {
  try {
    if (
      !newComment.value.contenu.trim() ||
      !newComment.value.auteur.nom.trim() ||
      !newComment.value.auteur.prenom.trim() ||
      !newComment.value.auteur.email.trim()
    )
      return;

    const response = await fetch(
      `http://localhost:3000/api/tasks/${props.taskId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment.value),
      }
    );

    if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");

    await fetchTaskDetails();
    showAddComment.value = false;
    newComment.value = {
      auteur: {
        nom: "",
        prenom: "",
        email: "",
      },
      contenu: "",
    };
  } catch (err) {
    error.value = err.message;
  }
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
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.author-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
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

.task-priority.critique {
  background-color: #ff4757;
  color: white;
  font-weight: bold;
}

.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-status.faire {
  background-color: #ff9f43;
  color: white;
}

.task-status.cours {
  background-color: #54a0ff;
  color: white;
}

.task-status.terminé {
  background-color: #10ac84;
  color: white;
}

.task-status.annulée {
  background-color: #576574;
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

.modal-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.delete-button {
  background-color: #ff4757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #ff6b81;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.add-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: var(--secondary-color);
}

.add-form {
  background-color: var(--background-color);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 12px;
}

textarea.form-input {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.button-submit {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.button-cancel {
  background-color: #e0e0e0;
  color: var(--text-color);
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.author-info {
  background-color: var(--background-color);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.author-name {
  display: flex;
  gap: 8px;
  align-items: center;
}

.author-email {
  color: var(--primary-color);
  margin: 0;
}

.author-email a {
  color: inherit;
  text-decoration: none;
}

.author-email a:hover {
  text-decoration: underline;
}
</style>
