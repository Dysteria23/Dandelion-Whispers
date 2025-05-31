// --- Datos simulados iniciales ---
const initialPosts = [
  {
    id: 1,
    title: "Last Weekend at the Call Center",
    content: "Last weekend, I worked an extra shift at the call center because one of my coworkers called in sick. It was stressful, but I handled it. I answered more than 100 calls and helped customers with various issues.",
    category: "Call Center Life",
    date: new Date("2025-05-25"),
    comments: []
  },
  {
    id: 2,
    title: "Handling Difficult Customers",
    content: "Staying calm is the key. Listening first, speaking second. Never take it personally.",
    category: "Tips & Tricks",
    date: new Date("2025-05-27"),
    comments: []
  }
];

// --- Variables y referencias ---
let posts = [];
let currentUser = { username: "guest", role: "lector" }; // roles: lector, escritor, admin

const loader = document.getElementById("loader");
const contenido = document.getElementById("contenido");
const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");
const asideCategories = document.getElementById("aside-categories");
const newPostSection = document.getElementById("new-post");
const quoteEl = document.getElementById("quote");
const toggleQuoteBtn = document.getElementById("toggle-quote");
const toggleThemeBtn = document.getElementById("toggle-theme");

const quotes = [
  "Make a wish, let it go, and trust the wind. – Dandelion proverb",
  "Even the smallest seed can bloom into the greatest flower.",
  "Breathe deeply, and let your worries drift away like dandelion fluff.",
  "Kindness is the sunshine that helps our souls grow.",
  "Life is a garden; tend it with care and patience."
];

let quoteIndex = 0;

// --- Funciones principales ---

// Cargar posts desde localStorage o iniciales
function loadPosts() {
  const saved = localStorage.getItem("posts");
  if (saved) {
    posts = JSON.parse(saved);
    // Convertir fechas de string a Date
    posts.forEach(p => p.date = new Date(p.date));
  } else {
    posts = initialPosts;
  }
}

// Guardar posts en localStorage
function savePosts() {
  localStorage.setItem("posts", JSON.stringify(posts));
}

// Mostrar posts filtrados y buscados
function renderPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const categoryTerm = categoryFilter.value;

  // Filtrar y ordenar por fecha descendente
  const filtered = posts
    .filter(p => 
      p.title.toLowerCase().includes(searchTerm) || 
      p.content.toLowerCase().includes(searchTerm)
    )
    .filter(p => (categoryTerm === "" || p.category === categoryTerm))
    .sort((a,b) => b.date - a.date);

  postsContainer.innerHTML = "";

  if(filtered.length === 0) {
    postsContainer.innerHTML = "<p>No hay entradas que coincidan.</p>";
    return;
  }

  filtered.forEach(post => {
    const postEl = document.createElement("article");
    postEl.className = "post";

    postEl.innerHTML = `
      <h2>${post.title}</h2>
      <small>${post.date.toLocaleDateString()} | <em>${post.category}</em></small>
      <p>${post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content}</p>
      <a href="#" class="read-more" data-id="${post.id}">Leer más</a>

      <section class="comments" id="comments-${post.id}">
        <h4>Comentarios</h4>
        <ul id="comments-list-${post.id}"></ul>
        <textarea id="comment-input-${post.id}" placeholder="Escribe un comentario..." rows="3"></textarea>
        <button onclick="addComment(${post.id})">Comentar</button>
      </section>
    `;

    postsContainer.appendChild(postEl);

    renderComments(post.id);
  });
}

// Renderizar comentarios de una entrada
function renderComments(postId) {
  const post = posts.find(p => p.id === postId);
  const commentsList = document.getElementById(`comments-list-${postId}`);
  commentsList.innerHTML = "";

  post.comments.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.user}: ${c.text}`;
    commentsList.appendChild(li);
  });
}

// Añadir comentario a un post
function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if(text === "") return alert("El comentario no puede estar vacío.");

  const post = posts.find(p => p.id === postId);
  post.comments.push({ user: currentUser.username, text });
  input.value = "";
  savePosts();
  renderComments(postId);
}

// Añadir nueva entrada (solo para escritores/admin)
function addPost() {
  if(currentUser.role !== "escritor" && currentUser.role !== "admin") {
    return alert("No tienes permisos para publicar entradas.");
  }

  const title = document.getElementById("new-title").value.trim();
  const category = document.getElementById("new-category").value.trim() || "Sin categoría";
  const content = document.getElementById("new-content").value.trim();

  if(!title || !content) {
    return alert("Título y contenido son obligatorios.");
  }

  const newPost = {
    id: Date.now(),
    title,
    category,
    content,
    date: new Date(),
    comments: []
  };

  posts.push(newPost);
  savePosts();
  renderPosts();
  updateCategories();
  clearNewPostForm();
  alert("Entrada publicada correctamente.");
}

function clearNewPostForm() {
  document.getElementById("new-title").value = "";
  document.getElementById("new-category").value = "";
  document.getElementById("new-content").value = "";
}

// Actualizar listado de categorías en filtro y sidebar
function updateCategories() {
  const categories = [...new Set(posts.map(p => p.category))].sort();

  // Actualizar filtro select
  categoryFilter.innerHTML = `<option value="">Todas las categorías</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Actualizar aside categorías
  asideCategories.innerHTML = "";
  categories.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat;
    asideCategories.appendChild(li);
  });
}

// Mostrar siguiente frase inspiradora
function showNextQuote() {
  quoteIndex = (quoteIndex + 1) % quotes.length;
  quoteEl.textContent = quotes[quoteIndex];
  quoteEl.classList.remove("hidden");
}

// Alternar visibilidad de la cita
toggleQuoteBtn.addEventListener("click", () => {
  if (quoteEl.classList.contains("hidden")) {
    showNextQuote();
    toggleQuoteBtn.textContent = "❌ Ocultar inspiración";
  } else {
    quoteEl.classList.add("hidden");
    toggleQuoteBtn.textContent = "🌼 Mostrar inspiración";
  }
});

// Modo oscuro
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if(document.body.classList.contains("dark")){
    toggleThemeBtn.textContent = "☀️ Modo Claro";
  } else {
    toggleThemeBtn.textContent = "🌙 Modo Oscuro";
  }
});

// Mostrar contenido y ocultar loader
function showContent() {
  loader.style.display = "none";
  contenido.style.display = "block";
}

// Inicialización
function init() {
  loadPosts();
  renderPosts();
  updateCategories();

  // Mostrar sección nueva entrada si usuario tiene permisos
  if (currentUser.role === "escritor" || currentUser.role === "admin") {
    newPostSection.classList.remove("hidden");
  }

  // Mostrar contenido después de animación de loader simulada
  setTimeout(showContent, 1500);
}

init();
