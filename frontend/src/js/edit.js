let subtaskCount = 0;
let commentCount = 0;
let taskId = null;

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

// Fonction pour remplir le formulaire avec les données de la tâche
function fillFormWithTaskData(task) {
  document.getElementById("titre").value = task.titre;
  document.getElementById("description").value = task.description;
  document.getElementById("echeance").value = new Date(task.echeance)
    .toISOString()
    .slice(0, 16);
  document.getElementById("statut").value = task.statut;
  document.getElementById("priorite").value = task.priorite;
  document.getElementById("categorie").value = task.categorie;
  document.getElementById("auteurNom").value = task.auteur?.nom || "";
  document.getElementById("auteurPrenom").value = task.auteur?.prenom || "";
  document.getElementById("auteurEmail").value = task.auteur?.email || "";
  document.getElementById("etiquettes").value =
    task.etiquettes?.join(", ") || "";

  // Remplir les sous-tâches
  const sousTachesContainer = document.getElementById("sousTaches");
  sousTachesContainer.innerHTML = "";
  task.sousTaches?.forEach((subtask, index) => {
    const newSubtask = document.createElement("div");
    newSubtask.className = "subtask-item";
    newSubtask.innerHTML = `
      <input type="text" name="sousTaches[${index}].titre" value="${
      subtask.titre
    }" placeholder="Titre de la sous-tâche">
      <select name="sousTaches[${index}].statut">
        <option value="à faire" ${
          subtask.statut === "à faire" ? "selected" : ""
        }>À faire</option>
        <option value="en cours" ${
          subtask.statut === "en cours" ? "selected" : ""
        }>En cours</option>
        <option value="terminée" ${
          subtask.statut === "terminée" ? "selected" : ""
        }>Terminée</option>
        <option value="annulée" ${
          subtask.statut === "annulée" ? "selected" : ""
        }>Annulée</option>
      </select>
      <input type="datetime-local" name="sousTaches[${index}].echeance" value="${new Date(
      subtask.echeance
    )
      .toISOString()
      .slice(0, 16)}">
      <button type="button" class="remove-subtask">Supprimer</button>
    `;
    sousTachesContainer.appendChild(newSubtask);
  });
  subtaskCount = task.sousTaches?.length || 0;

  // Remplir les commentaires
  const commentairesContainer = document.getElementById("commentaires");
  commentairesContainer.innerHTML = "";
  task.commentaires?.forEach((comment, index) => {
    const newComment = document.createElement("div");
    newComment.className = "comment-item";
    newComment.innerHTML = `
      <textarea name="commentaires[${index}].contenu" placeholder="Contenu du commentaire">${comment.contenu}</textarea>
      <input type="text" name="commentaires[${index}].auteur" value="${comment.auteur}" placeholder="Auteur du commentaire">
      <button type="button" class="remove-comment">Supprimer</button>
    `;
    commentairesContainer.appendChild(newComment);
  });
  commentCount = task.commentaires?.length || 0;
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

// Initialisation de la page
async function init() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    taskId = urlParams.get("id");

    if (!taskId) {
      throw new Error("ID de tâche non fourni");
    }

    const task = await getTask(taskId);
    fillFormWithTaskData(task);

    // Ajouter les gestionnaires d'événements
    document.getElementById("addSubtask").addEventListener("click", addSubtask);
    document.getElementById("addComment").addEventListener("click", addComment);

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

    document
      .getElementById("taskForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const formData = new FormData(e.target);
          const taskData = formatFormData(formData);
          await updateTask(taskId, taskData);
          alert("Tâche modifiée avec succès !");
          window.location.href = "index.html";
        } catch (error) {
          alert(
            "Erreur lors de la modification de la tâche : " + error.message
          );
        }
      });
  } catch (error) {
    console.error("Erreur:", error);
    alert(
      "Une erreur est survenue lors du chargement de la tâche : " +
        error.message
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
