// Fonction pour appliquer les filtres
function applyFilters(tasks) {
  const filterForm = document.getElementById("filterForm");
  const formData = new FormData(filterForm);
  const filters = Object.fromEntries(formData.entries());

  return tasks
    .filter((task) => {
      // Si aucun filtre n'est appliqué, on garde la tâche
      if (
        !filters.statut &&
        !filters.priorite &&
        !filters.categorie &&
        !filters.search &&
        !filters.etiquette &&
        !filters.echeance
      ) {
        return true;
      }

      // Filtre par statut
      if (
        filters.statut &&
        (!task.statut ||
          task.statut.toLowerCase().trim() !==
            filters.statut.toLowerCase().trim())
      ) {
        return false;
      }

      // Filtre par priorité
      if (
        filters.priorite &&
        (!task.priorite ||
          task.priorite.toLowerCase().trim() !==
            filters.priorite.toLowerCase().trim())
      ) {
        return false;
      }

      // Filtre par catégorie
      if (
        filters.categorie &&
        (!task.categorie ||
          task.categorie.toLowerCase().trim() !==
            filters.categorie.toLowerCase().trim())
      ) {
        return false;
      }

      // Filtre par recherche
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        const matchesSearch =
          task.titre.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm);
        if (!matchesSearch) {
          return false;
        }
      }

      // Filtre par étiquette
      if (filters.etiquette) {
        const searchEtiquette = filters.etiquette.toLowerCase().trim();
        if (
          !task.etiquettes ||
          !task.etiquettes.some((etiquette) =>
            etiquette.toLowerCase().includes(searchEtiquette)
          )
        ) {
          return false;
        }
      }

      // Filtre par échéance
      if (filters.echeance) {
        const filterDate = new Date(filters.echeance);
        const taskDate = new Date(task.echeance);
        if (taskDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const sortBy = filters.sortBy || "dateCreation";
      const sortOrder = filters.sortOrder || "asc";

      let comparison = 0;

      switch (sortBy) {
        case "dateCreation":
          comparison = new Date(a.dateCreation) - new Date(b.dateCreation);
          break;
        case "echeance":
          comparison = new Date(a.echeance) - new Date(b.echeance);
          break;
        case "priorite":
          const priorityOrder = { basse: 1, moyenne: 2, haute: 3, critique: 4 };
          comparison = priorityOrder[a.priorite] - priorityOrder[b.priorite];
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
}

async function displayTasks() {
  const tasks = await getTasks();
  const filteredTasks = applyFilters(tasks);
  const taskList = document.getElementById("taskList");

  taskList.innerHTML = `
    <thead>
      <tr>
        <th>Titre</th>
        <th>Description</th>
        <th>Statut</th>
        <th>Priorité</th>
        <th>Catégorie</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${filteredTasks
        .map(
          (task) => `
        <tr>
          <td>${task.titre}</td>
          <td>${task.description}</td>
          <td class="statut-${task.statut.toLowerCase().replace(" ", "-")}">${
            task.statut
          }</td>
          <td class="priorite-${task.priorite.toLowerCase()}">${
            task.priorite
          }</td>
          <td class="categorie-${task.categorie.toLowerCase()}">${
            task.categorie
          }</td>
          <td>
            <a href="detail.html?id=${task._id}" class="button">Voir</a>
            <a href="edit.html?id=${
              task._id
            }" class="button button-secondary">Modifier</a>
            <button onclick="deleteTask('${
              task._id
            }')" class="button button-danger">Supprimer</button>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
}

// Fonction pour supprimer une tâche
async function deleteTask(taskId) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    try {
      await deleteTaskFromAPI(taskId);
      displayTasks(); // Correction : loadTasks -> displayTasks
    } catch (error) {
      alert("Erreur lors de la suppression de la tâche : " + error.message);
    }
  }
}

// Autres fonctions UI...

// Gestionnaire d'événements pour le formulaire de filtres
document.addEventListener("DOMContentLoaded", () => {
  displayTasks();

  const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      displayTasks();
    });

    filterForm.addEventListener("reset", () => {
      displayTasks();
    });
  }
});
