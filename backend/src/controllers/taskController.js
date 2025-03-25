const { MongoClient, ObjectId } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

exports.getAllTasks = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("local");
    const collection = db.collection("tasks");
    const tasks = await collection.find({}).toArray();
    res.json(tasks);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    await client.close();
  }
};

exports.getTaskById = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("local");
    const collection = db.collection("tasks");
    const task = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!task) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // S'assurer que les champs optionnels sont présents
    task.statut = task.statut || "à faire";
    task.priorite = task.priorite || "moyenne";
    task.categorie = task.categorie || "autre";
    task.etiquettes = task.etiquettes || [];
    task.sousTaches = task.sousTaches || [];
    task.commentaires = task.commentaires || [];
    task.historiqueModifications = task.historiqueModifications || [];

    res.json(task);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    await client.close();
  }
};

// Nouvelle fonction pour créer une tâche
exports.createTask = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("local");
    const collection = db.collection("tasks");

    // Validation des champs requis
    if (!req.body.titre || !req.body.description || !req.body.echeance) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const newTask = {
      ...req.body,
      dateCreation: new Date(),
      statut: req.body.statut || "à faire",
      priorite: req.body.priorite || "moyenne",
      categorie: req.body.categorie || "autre",
      etiquettes: req.body.etiquettes || [],
      sousTaches: req.body.sousTaches || [],
      commentaires: req.body.commentaires || [],
      historiqueModifications: [],
    };

    const result = await collection.insertOne(newTask);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    await client.close();
  }
};

// Fonction pour mettre à jour une tâche
exports.updateTask = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("local");
    const collection = db.collection("tasks");

    const taskId = new ObjectId(req.params.id);
    const existingTask = await collection.findOne({ _id: taskId });

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
            champ: key,
            ancienneValeur: existingTask[key],
            nouvelleValeur: newData[key],
            dateModification: new Date(),
          });
        }
      }
    });

    // Mettre à jour la tâche avec les nouvelles données et l'historique
    const updatedTask = {
      ...newData,
      historiqueModifications: [
        ...(existingTask.historiqueModifications || []),
        ...modifications,
      ],
    };

    const result = await collection.updateOne(
      { _id: taskId },
      { $set: updatedTask }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Aucune modification effectuée" });
    }

    res.json({ message: "Tâche mise à jour avec succès" });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    await client.close();
  }
};

// Fonction pour supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("local");
    const collection = db.collection("tasks");
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    await client.close();
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
