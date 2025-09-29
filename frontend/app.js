const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");

async function loadTodos() {
  const res = await fetch("/api/todos");
  const todos = await res.json();
  list.innerHTML = "";
  todos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.text;
    list.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  input.value = "";
  loadTodos();
});

loadTodos();
