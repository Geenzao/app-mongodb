const Task = require("../models/Task");

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }
    res.json(task);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Nouvelle fonction pour créer une tâche
exports.createTask = async (req, res) => {
  try {
    // Validation des champs requis
    if (!req.body.titre) {
      return res.status(400).json({ error: "Le titre est obligatoire" });
    }

    // Création d'une nouvelle tâche avec Mongoose
    const newTask = new Task({
      titre: req.body.titre,
      description: req.body.description,
      dateEcheance: req.body.dateEcheance,
      statut: req.body.statut,
      priorite: req.body.priorite,
      categorie: req.body.categorie,
      etiquettes: req.body.etiquettes,
      sousTaches: req.body.sousTaches,
      commentaires: req.body.commentaires,
    });

    // Sauvegarde de la tâche
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Fonction pour mettre à jour une tâche
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Récupérer la tâche existante
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // Créer l'entrée d'historique
    const modifications = [];
    const newData = req.body;

    // Comparer chaque champ et enregistrer les modifications
    Object.keys(newData).forEach((key) => {
      if (key !== "historiqueModifications" && key !== "_id") {
        if (
          JSON.stringify(existingTask[key]) !== JSON.stringify(newData[key])
        ) {
          modifications.push({
            modification: `${key} modifié de ${existingTask[key]} à ${newData[key]}`,
            date: new Date(),
          });
        }
      }
    });

    // Ajouter les nouvelles modifications à l'historique existant
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        ...newData,
        $push: {
          historiqueModifications: {
            $each: modifications,
          },
        },
      },
      { new: true } // Cette option retourne le document mis à jour
    );

    res.json(updatedTask);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Fonction pour supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Recherche et suppression de la tâche
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.addComment = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("local");
    const collection = db.collection("tasks");

    const taskId = new ObjectId(req.params.id);
    const newComment = {
      contenu: req.body.contenu,
      auteur: req.body.auteur || "Anonyme",
      date: new Date(),
    };

    const result = await collection.updateOne(
      { _id: taskId },
      { $push: { commentaires: newComment } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    res.json(newComment);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({
      error: "Erreur serveur",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    await client.close();
  }
};

// Autres méthodes du controller...
