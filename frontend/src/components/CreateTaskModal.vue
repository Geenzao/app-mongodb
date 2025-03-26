<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Créer une nouvelle tâche</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="createTask" class="task-form">
        <div class="author-fields">
          <h3>Informations de l'auteur</h3>
          <div class="author-inputs">
            <div class="input-group">
              <label for="prenom">Prénom</label>
              <input
                v-model="newTask.auteur.prenom"
                id="prenom"
                placeholder="Prénom"
                class="form-input"
                required />
            </div>
            <div class="input-group">
              <label for="nom">Nom</label>
              <input
                v-model="newTask.auteur.nom"
                id="nom"
                placeholder="Nom"
                class="form-input"
                required />
            </div>
            <div class="input-group">
              <label for="email">Email</label>
              <input
                v-model="newTask.auteur.email"
                id="email"
                placeholder="Email"
                class="form-input"
                type="email"
                required />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="titre">Titre*</label>
          <input type="text" id="titre" v-model="newTask.titre" required />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" v-model="newTask.description"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="statut">Statut</label>
            <select id="statut" v-model="newTask.statut">
              <option value="à faire">À faire</option>
              <option value="en cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="annulée">Annulée</option>
            </select>
          </div>

          <div class="form-group">
            <label for="priorite">Priorité</label>
            <select id="priorite" v-model="newTask.priorite">
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="categorie">Catégorie</label>
          <input type="text" id="categorie" v-model="newTask.categorie" />
        </div>

        <div class="form-group">
          <label for="dateEcheance">Date d'échéance</label>
          <input type="date" id="dateEcheance" v-model="newTask.dateEcheance" />
        </div>

        <div class="form-group">
          <label for="etiquettes">Étiquettes (séparées par des virgules)</label>
          <input type="text" id="etiquettes" v-model="etiquettesInput" />
        </div>

        <div class="form-actions">
          <button type="submit" class="button-submit">Créer la tâche</button>
          <button type="button" class="button-cancel" @click="closeModal">
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "taskCreated"]);

const newTask = ref({
  titre: "",
  description: "",
  statut: "à faire",
  priorite: "moyenne",
  categorie: "",
  dateEcheance: "",
  etiquettes: [],
  auteur: {
    nom: "",
    prenom: "",
    email: "",
  },
});

const etiquettesInput = ref("");

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  newTask.value = {
    titre: "",
    description: "",
    statut: "à faire",
    priorite: "moyenne",
    categorie: "",
    dateEcheance: "",
    etiquettes: [],
    auteur: {
      nom: "",
      prenom: "",
      email: "",
    },
  };
  etiquettesInput.value = "";
};

const createTask = async () => {
  try {
    const taskToCreate = {
      titre: newTask.value.titre,
      description: newTask.value.description,
      statut: newTask.value.statut,
      priorite: newTask.value.priorite,
      categorie: newTask.value.categorie,
      dateEcheance: newTask.value.dateEcheance,
      auteur: {
        nom: newTask.value.auteur.nom,
        prenom: newTask.value.auteur.prenom,
        email: newTask.value.auteur.email,
      },
      etiquettes: etiquettesInput.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
    };

    console.log("Données envoyées :", taskToCreate);

    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskToCreate),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.details
          ? responseData.details.join("\n")
          : responseData.error || "Erreur lors de la création de la tâche"
      );
    }

    emit("taskCreated", responseData);
    closeModal();
  } catch (error) {
    console.error("Détails de l'erreur:", error);
    alert(error.message);
  }
};
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  font-weight: 500;
  color: var(--text-color);
}

input,
select,
textarea {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.button-submit {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.button-cancel {
  background-color: #e0e0e0;
  color: var(--text-color);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}

.author-fields {
  margin-bottom: 20px;
}

.author-fields h3 {
  margin-bottom: 12px;
  color: var(--text-color);
  font-size: 1.1rem;
}

.author-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--text-color);
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
