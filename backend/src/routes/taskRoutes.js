const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/tasks", taskController.getFilteredAndSortedTasks);
router.get("/tasks/:id", taskController.getTaskById);
router.post("/tasks", taskController.createTask);
router.put("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);
router.post("/tasks/:id/comments", taskController.addComment);
router.post("/tasks/:id/subtasks", taskController.addSubTask);
router.get("/tasks/filter", taskController.filterTasks);
router.get("/tasks/sort", taskController.sortTasks);

module.exports = router;
