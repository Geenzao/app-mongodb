const Task = require("../models/Task");

//Fonction pour récuperer toutes les taches
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//Fonction pour récuperer une seule tache
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

//Fonction pour ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const newComment = {
      texte: req.body.contenu,
      date: new Date(),
    };

    const modificationEntry = {
      modification: `Commentaire ajouté: ${req.body.contenu}`,
      date: new Date(),
    };

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          commentaires: newComment,
          historiqueModifications: modificationEntry,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
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
  }
};

//Fonction pour ajouter une sous tache
exports.addSubTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const newSubTask = {
      titre: req.body.titre,
      complete: false,
    };

    const modificationEntry = {
      modification: `Sous-tâche ajoutée: ${req.body.titre}`,
      date: new Date(),
    };

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          sousTaches: newSubTask,
          historiqueModifications: modificationEntry,
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    res.status(201).json(newSubTask);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({
      error: "Erreur serveur",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

exports.filterTasks = async (req, res) => {
  try {
    const filters = {};

    // Ajouter les filtres si présents dans la requête
    if (req.query.statut) filters.statut = req.query.statut;
    if (req.query.priorite) filters.priorite = req.query.priorite;
    if (req.query.categorie) filters.categorie = req.query.categorie;
    if (req.query.etiquette) filters.etiquettes = req.query.etiquette;
    if (req.query.dateEcheance) {
      filters.dateEcheance = {
        $lte: new Date(req.query.dateEcheance),
      };
    }

    const tasks = await Task.find(filters);
    res.json(tasks);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.sortTasks = async (req, res) => {
  try {
    const sortOptions = {};

    // Ajouter les options de tri
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(",");
      sortFields.forEach((field) => {
        const [key, order] = field.split(":");
        sortOptions[key] = order === "desc" ? -1 : 1;
      });
    }

    const tasks = await Task.find().sort(sortOptions);
    res.json(tasks);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getFilteredAndSortedTasks = async (req, res) => {
  try {
    // Construction des filtres
    const filters = {};

    if (req.query.statut) filters.statut = req.query.statut;
    if (req.query.priorite) filters.priorite = req.query.priorite;
    if (req.query.categorie) filters.categorie = req.query.categorie;
    if (req.query.etiquette) filters.etiquettes = req.query.etiquette;
    if (req.query.dateEcheance) {
      filters.dateEcheance = {
        $lte: new Date(req.query.dateEcheance),
      };
    }

    // Construction des options de tri
    const sortOptions = {};
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(",");
      sortFields.forEach((field) => {
        const [key, order] = field.split(":");
        sortOptions[key] = order === "desc" ? -1 : 1;
      });
    }

    // Exécution de la requête avec filtres et tri
    const tasks = await Task.find(filters).sort(sortOptions);
    res.json(tasks);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
