const API_URL = "http://localhost:3000/api";

async function getTasks() {
  const response = await fetch(`${API_URL}/tasks`);
  return response.json();
}

async function getTask(id) {
  const response = await fetch(`${API_URL}/tasks/${id}`);
  return response.json();
}

async function updateTask(id, taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de la tâche");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}

// Fonction pour supprimer une tâche
async function deleteTaskFromAPI(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la tâche");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}

// Autres fonctions d'API...
