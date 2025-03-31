const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
});

const taskSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, "Le titre est obligatoire"],
  },
  description: {
    type: String,
    default: "",
  },
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminé", "annulée"],
    default: "à faire",
  },
  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute", "critique"],
    default: "moyenne",
  },
  categorie: {
    type: String,
    default: "autre",
  },
  etiquettes: [
    {
      type: String,
    },
  ],
  sousTaches: [
    {
      titre: String,
      complete: {
        type: Boolean,
        default: false,
      },
    },
  ],
  auteur: {
    type: authorSchema,
    required: true,
  },
  commentaires: [
    {
      auteur: {
        type: authorSchema,
        required: true,
      },
      contenu: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  historiqueModifications: [
    {
      modification: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  dateEcheance: Date,
});

// Ajout des index
taskSchema.index({ statut: 1 }); // Index pour le filtre par statut
taskSchema.index({ priorite: 1 }); // Index pour le filtre par priorité
taskSchema.index({ categorie: 1 }); // Index pour le filtre par catégorie
taskSchema.index({ etiquettes: 1 }); // Index pour le filtre par étiquette
taskSchema.index({ dateEcheance: 1 }); // Index pour le filtre par échéance
taskSchema.index({ titre: 1 }); // Index pour le filtre par titre
taskSchema.index({ description: 1 }); // Index pour le filtre par description
taskSchema.index({ dateCreation: 1 }); // Index pour le tri par date de création
taskSchema.index({ priorite: 1, dateEcheance: 1 }); // Index composé pour tri par priorité et échéance

module.exports = mongoose.model("Task", taskSchema);
