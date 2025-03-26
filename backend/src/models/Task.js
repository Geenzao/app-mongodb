const mongoose = require("mongoose");

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
    enum: ["à faire", "en cours", "terminé"],
    default: "à faire",
  },
  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute"],
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
  commentaires: [
    {
      texte: String,
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

module.exports = mongoose.model("Task", taskSchema);
