<template>
  <div class="task-card" @click="$emit('click', task._id)">
    <div class="task-header">
      <div class="task-title-container">
        <h3 class="task-title">{{ task.titre }}</h3>
        <span class="task-priority" :class="task.priorite">
          {{ task.priorite }}
        </span>
      </div>
      <span class="task-status" :class="task.statut">{{ task.statut }}</span>
    </div>

    <p class="task-description">{{ task.description }}</p>

    <div class="task-metadata">
      <span class="task-category">{{ task.categorie }}</span>
      <span class="task-date"
        >Échéance: {{ formatDate(task.dateEcheance) }}</span
      >
    </div>

    <div class="task-tags">
      <span v-for="tag in task.etiquettes" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

defineEmits(["click"]);

const formatDate = (date) => {
  if (!date) return "Pas de date";
  return new Date(date).toLocaleDateString("fr-FR");
};
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
}

.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-status.à\ faire {
  background-color: #ff9f43;
  color: white;
}

.task-status.en\ cours {
  background-color: #54a0ff;
  color: white;
}

.task-status.terminé {
  background-color: #10ac84;
  color: white;
}

.task-priority {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.task-priority.haute {
  background-color: #ff4757;
  color: white;
}

.task-priority.moyenne {
  background-color: #ffa502;
  color: white;
}

.task-priority.basse {
  background-color: #7bed9f;
  color: white;
}

.task-description {
  color: #666;
  margin: 8px 0;
}

.task-metadata {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 0.9rem;
  color: #666;
}

.task-category {
  background-color: #f1f2f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>
