<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ task.titre }}</h2>
        <div class="modal-actions">
          <button class="delete-button" @click="confirmDelete">
            Supprimer
          </button>
          <button class="edit-button" @click="openEditModal">Modifier</button>
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

      <div v-if="showEditModal" class="modal-overlay edit-modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Modifier la tâche</h2>
            <button class="close-button" @click="closeEditModal">
              &times;
            </button>
          </div>
          <form @submit.prevent="updateTask" class="task-form">
            <div class="form-group">
              <label for="titre">Titre*</label>
              <input
                type="text"
                id="titre"
                v-model="task.titre"
                required
                class="form-input" />
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="task.description"
                class="form-textarea"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="statut">Statut</label>
                <select id="statut" v-model="task.statut" class="form-select">
                  <option value="à faire">À faire</option>
                  <option value="en cours">En cours</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulée">Annulée</option>
                </select>
              </div>

              <div class="form-group">
                <label for="priorite">Priorité</label>
                <select
                  id="priorite"
                  v-model="task.priorite"
                  class="form-select">
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="categorie">Catégorie</label>
              <input
                type="text"
                id="categorie"
                v-model="task.categorie"
                class="form-input" />
            </div>

            <div class="form-group">
              <label for="dateEcheance">Date d'échéance</label>
              <input
                type="date"
                id="dateEcheance"
                v-model="task.dateEcheance"
                class="form-input" />
            </div>

            <div class="form-actions">
              <button type="submit" class="button button-primary">
                Enregistrer
              </button>
              <button
                type="button"
                class="button button-secondary"
                @click="closeEditModal">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const props = defineProps({
  show: Boolean,
  taskId: String,
});

const emit = defineEmits(["close", "taskDeleted", "taskUpdated"]);

const task = ref({});
const loading = ref(false);
const error = ref(null);

// États pour les formulaires
const showAddSubTask = ref(false);
const showAddComment = ref(false);
const showEditModal = ref(false);
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

      toast.success("Tâche supprimée avec succès !");
      emit("taskDeleted", props.taskId);
      closeModal();
    } catch (err) {
      error.value = err.message;
      toast.error("Erreur lors de la suppression : " + err.message);
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

    const newSubTask = await response.json();

    task.value.sousTaches.push(newSubTask);

    emit("taskUpdated", task.value);

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

    const newComment = await response.json();

    task.value.commentaires.push(newComment);

    emit("taskUpdated", task.value);

    showAddComment.value = false;
  } catch (err) {
    error.value = err.message;
  }
};

const openEditModal = () => {
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const updateTask = async () => {
  try {
    const taskToUpdate = {
      titre: task.value.titre,
      description: task.value.description,
      statut: task.value.statut,
      priorite: task.value.priorite,
      categorie: task.value.categorie,
      dateEcheance: task.value.dateEcheance,
    };

    const response = await fetch(
      `http://localhost:3000/api/tasks/${props.taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskToUpdate),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Erreur lors de la mise à jour de la tâche"
      );
    }

    const updatedTaskData = await response.json();

    task.value = updatedTaskData;

    emit("taskUpdated", updatedTaskData);

    toast.success("Tâche mise à jour avec succès !");
    closeEditModal();
  } catch (err) {
    error.value = err.message;
    toast.error("Erreur lors de la mise à jour : " + err.message);
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--primary-color);
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(90vh - 150px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.form-select {
  appearance: none;
  background-color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.button-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.button-primary:hover {
  background-color: var(--secondary-color);
}

.button-secondary {
  background-color: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.button-secondary:hover {
  background-color: var(--background-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.close-button:hover {
  color: var(--primary-color);
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
