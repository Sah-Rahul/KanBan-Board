let draged = null;
let rightClicked = null;

document.addEventListener("DOMContentLoaded", loadTaskToLocalStorage);

// Add task
function addTask(columnId) {
  const input = document.getElementById(`${columnId}-input`);
  const prioritySelect = document.getElementById(`${columnId}-priority`);
  const inputValue = input.value.trim();
  const priority = prioritySelect.value;

  if (inputValue === "") return;

  let Taskdate = new Date().toLocaleString();
  const taskElement = createTaskElement(inputValue, Taskdate, priority);
  document.getElementById(`${columnId}-tasks`).appendChild(taskElement);

  input.value = "";
  updateTask(columnId);
  saveAllToLocalStorage();
}

// Create task element with priority
function createTaskElement(taskText, Taskdate, priority = "low") {
  const taskElement = document.createElement("div");
  taskElement.innerHTML = `<span>${taskText}</span></br><small class="date">${Taskdate}</small>`;
  taskElement.classList.add("text", priority); 
  taskElement.draggable = true;

  taskElement.addEventListener("dragstart", dragStrat);
  taskElement.addEventListener("dragend", dragEnd);
  taskElement.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    rightClicked = this;
    showContextMenu(e.pageX, e.pageY);
  });

  return taskElement;
}

// Drag events
function dragStrat() {
  this.classList.add("dragging");
  draged = this;
}
function dragEnd() {
  this.classList.remove("dragging");
  draged = null;
  ["todo", "doing", "done"].forEach(updateTask);
  saveAllToLocalStorage();
}

const columns = document.querySelectorAll(".column .tasks");
columns.forEach((col) => {
  col.addEventListener("dragover", dragOver);
});
function dragOver(e) {
  e.preventDefault();
  this.appendChild(draged);
}

// Right-click menu
let edit = document.querySelector(".edit");
function showContextMenu(x, y) {
  edit.style.left = `${x}px`;
  edit.style.top = `${y}px`;
  edit.style.display = "block";
}
document.addEventListener("click", function () {
  edit.style.display = "none";
});

// Edit task
function editTask() {
  const oldText = rightClicked.querySelector("span").textContent;
  const newTaskText = prompt("Edit your task:", oldText);
  if (newTaskText !== null && newTaskText.trim() !== "") {
    const date = rightClicked.querySelector(".date").outerHTML;
    rightClicked.innerHTML = `<span>${newTaskText}</span><br>${date}`;
    saveAllToLocalStorage();
  }
}

// Delete task
function deleteTask() {
  if (!rightClicked) return;
  const colId = rightClicked.parentElement.id.replace("-tasks", "");
  rightClicked.remove();
  rightClicked = null;
  updateTask(colId);
  saveAllToLocalStorage();
}

// Update task count
function updateTask(colId) {
  const count = document.querySelectorAll(`#${colId}-tasks .text`).length;
  document.getElementById(`${colId}-count`).textContent = count;
}

// Save all tasks in localStorage
function saveAllToLocalStorage() {
  ["todo", "doing", "done"].forEach((colId) => {
    const tasks = [];
    document.querySelectorAll(`#${colId}-tasks .text`).forEach((el) => {
      const text = el.querySelector("span").textContent;
      const date = el.querySelector(".date").textContent;

      // Priority detection from classList
      const priority = el.classList.contains("high")
        ? "high"
        : el.classList.contains("medium")
        ? "medium"
        : "low";

      tasks.push({ text, date, priority });
    });
    localStorage.setItem(colId, JSON.stringify(tasks));
  });
}

// Load all tasks from localStorage
function loadTaskToLocalStorage() {
  ["todo", "doing", "done"].forEach((colId) => {
    const tasks = JSON.parse(localStorage.getItem(colId)) || [];
    tasks.forEach(({ text, date, priority }) => {
      const el = createTaskElement(text, date, priority);
      document.getElementById(`${colId}-tasks`).appendChild(el);
    });
    updateTask(colId);
  });
}
