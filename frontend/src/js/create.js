let subtaskCount = 1;
let commentCount = 1;

// Fonction pour ajouter une sous-tâche
function addSubtask() {
  const sousTachesContainer = document.getElementById("sousTaches");
  const newSubtask = document.createElement("div");
  newSubtask.className = "subtask-item";
  newSubtask.innerHTML = `
        <input type="text" name="sousTaches[${subtaskCount}].titre" placeholder="Titre de la sous-tâche">
        <select name="sousTaches[${subtaskCount}].statut">
            <option value="à faire">À faire</option>
            <option value="en cours">En cours</option>
            <option value="terminée">Terminée</option>
            <option value="annulée">Annulée</option>
        </select>
        <input type="datetime-local" name="sousTaches[${subtaskCount}].echeance">
        <button type="button" class="remove-subtask">Supprimer</button>
    `;
  sousTachesContainer.appendChild(newSubtask);
  subtaskCount++;
}

// Fonction pour ajouter un commentaire
function addComment() {
  const commentairesContainer = document.getElementById("commentaires");
  const newComment = document.createElement("div");
  newComment.className = "comment-item";
  newComment.innerHTML = `
        <textarea name="commentaires[${commentCount}].contenu" placeholder="Contenu du commentaire"></textarea>
        <input type="text" name="commentaires[${commentCount}].auteur" placeholder="Auteur du commentaire">
        <button type="button" class="remove-comment">Supprimer</button>
    `;
  commentairesContainer.appendChild(newComment);
  commentCount++;
}

// Fonction pour supprimer un élément
function removeElement(element) {
  element.remove();
}

// Fonction pour créer une tâche
async function createTask(taskData) {
  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de la tâche");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}

// Fonction pour formater les données du formulaire
function formatFormData(formData) {
  const taskData = {
    titre: formData.get("titre"),
    description: formData.get("description"),
    echeance: new Date(formData.get("echeance")),
    statut: formData.get("statut"),
    priorite: formData.get("priorite"),
    categorie: formData.get("categorie"),
    auteur: {
      nom: formData.get("auteur.nom"),
      prenom: formData.get("auteur.prenom"),
      email: formData.get("auteur.email"),
    },
    etiquettes: formData
      .get("etiquettes")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag),
    sousTaches: [],
    commentaires: [],
  };

  // Récupérer les sous-tâches
  for (let i = 0; i < subtaskCount; i++) {
    const titre = formData.get(`sousTaches[${i}].titre`);
    if (titre) {
      taskData.sousTaches.push({
        titre: titre,
        statut: formData.get(`sousTaches[${i}].statut`),
        echeance: formData.get(`sousTaches[${i}].echeance`)
          ? new Date(formData.get(`sousTaches[${i}].echeance`))
          : null,
      });
    }
  }

  // Récupérer les commentaires
  for (let i = 0; i < commentCount; i++) {
    const contenu = formData.get(`commentaires[${i}].contenu`);
    if (contenu) {
      taskData.commentaires.push({
        contenu: contenu,
        auteur: formData.get(`commentaires[${i}].auteur`),
        date: new Date(),
      });
    }
  }

  return taskData;
}

// Gestionnaire d'événements pour le formulaire
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);
    const taskData = formatFormData(formData);

    const result = await createTask(taskData);
    alert("Tâche créée avec succès !");
    window.location.href = "index.html";
  } catch (error) {
    alert("Erreur lors de la création de la tâche : " + error.message);
  }
});

// Gestionnaires d'événements pour les boutons
document.getElementById("addSubtask").addEventListener("click", addSubtask);
document.getElementById("addComment").addEventListener("click", addComment);

// Délégation d'événements pour les boutons de suppression
document.getElementById("sousTaches").addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-subtask")) {
    removeElement(e.target.parentElement);
  }
});

document.getElementById("commentaires").addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-comment")) {
    removeElement(e.target.parentElement);
  }
});
