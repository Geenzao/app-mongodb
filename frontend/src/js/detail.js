const API_URL = "http://localhost:3000/api";

async function getTaskById(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${id}`);
    if (!response.ok) {
      throw new Error("Tâche non trouvée");
    }
    const task = await response.json();
    console.log("Tâche reçue:", task);
    return task;
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche:", error);
    throw error;
  }
}

function formatDate(dateString) {
  if (!dateString) return "Non définie";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayAuthor(auteur) {
  const authorElement = document.getElementById("taskAuthor");
  if (!auteur) {
    authorElement.innerHTML = "<p>Auteur non défini</p>";
    return;
  }

  authorElement.innerHTML = `
    <p><strong>Nom:</strong> ${auteur.nom}</p>
    <p><strong>Prénom:</strong> ${auteur.prenom}</p>
    <p><strong>Email:</strong> ${auteur.email}</p>
  `;
}

function displayTags(etiquettes) {
  const tagsContainer = document.getElementById("taskTags");
  if (!etiquettes || etiquettes.length === 0) {
    tagsContainer.innerHTML = "<p>Aucune étiquette</p>";
    return;
  }

  const tagsHTML = etiquettes
    .map(
      (tag) => `
    <span class="tag">${tag}</span>
  `
    )
    .join("");

  tagsContainer.innerHTML = tagsHTML;
}

function displaySubtasks(sousTaches) {
  const subtasksList = document.getElementById("subtasksList");
  if (!sousTaches || sousTaches.length === 0) {
    subtasksList.innerHTML = "<p>Aucune sous-tâche</p>";
    return;
  }

  const subtasksHTML = sousTaches
    .map(
      (subtask) => `
    <div class="subtask-item">
      <h3>${subtask.titre}</h3>
      <p class="statut-${subtask.statut.toLowerCase().replace(" ", "-")}">${
        subtask.statut
      }</p>
      <p>Échéance: ${formatDate(subtask.echeance)}</p>
    </div>
  `
    )
    .join("");

  subtasksList.innerHTML = subtasksHTML;
}

function displayComments(commentaires) {
  const commentsList = document.getElementById("commentsList");
  if (!commentaires || commentaires.length === 0) {
    commentsList.innerHTML = "<p>Aucun commentaire</p>";
    return;
  }

  const commentsHTML = commentaires
    .map(
      (comment) => `
    <div class="comment-item">
      <p class="comment-text">${comment.contenu}</p>
      <p class="comment-date">${formatDate(comment.date)}</p>
      <p class="comment-author">Par: ${comment.auteur}</p>
    </div>
  `
    )
    .join("");

  commentsList.innerHTML = commentsHTML;
}

function displayTaskDetails(task) {
  console.log("Affichage des détails de la tâche:", task);

  // Vérification des champs requis
  if (
    !task.titre ||
    !task.description ||
    !task.dateCreation ||
    !task.echeance
  ) {
    throw new Error("Données de tâche incomplètes");
  }

  document.getElementById("taskTitle").textContent = task.titre;
  document.getElementById("taskDescription").textContent = task.description;

  const statusElement = document.getElementById("taskStatus");
  statusElement.textContent = task.statut || "à faire";
  statusElement.className = `statut-${(task.statut || "à faire")
    .toLowerCase()
    .replace(" ", "-")}`;

  const priorityElement = document.getElementById("taskPriority");
  priorityElement.textContent = task.priorite || "moyenne";
  priorityElement.className = `priorite-${(task.priorite || "moyenne")
    .toLowerCase()
    .replace(" ", "-")}`;

  const categoryElement = document.getElementById("taskCategory");
  categoryElement.textContent = task.categorie || "autre";
  categoryElement.className = `categorie-${(
    task.categorie || "autre"
  ).toLowerCase()}`;

  document.getElementById("taskCreatedAt").textContent = formatDate(
    task.dateCreation
  );
  document.getElementById("taskDueDate").textContent = formatDate(
    task.echeance
  );

  // Affichage des champs optionnels
  displayAuthor(task.auteur);
  displayTags(task.etiquettes);
  displaySubtasks(task.sousTaches);
  displayComments(task.commentaires);
}

async function init() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");

    if (!taskId) {
      throw new Error("ID de tâche non fourni");
    }

    const task = await getTaskById(taskId);
    displayTaskDetails(task);
  } catch (error) {
    console.error("Erreur:", error);
    alert(
      "Une erreur est survenue lors du chargement des détails de la tâche: " +
        error.message
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
