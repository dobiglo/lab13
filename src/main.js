import { supabase } from "./supabase";

const logoutButton = document.getElementById("logout-button");
const loginButton = document.getElementById("login-button");

supabase.auth.onAuthStateChange((_event, session) => {
  handleSession(session);
});

function handleSession(session) {
  if (session) {
    logoutButton.classList.remove("hidden");
    loginButton.classList.add("hidden");
  } else {
    logoutButton.classList.add("hidden");
    loginButton.classList.remove("hidden");
  }
}

async function init() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  handleSession(session);
}

init();

logoutButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (!error) {
    alert("Zostałeś wylogowany");
    window.location.href = "login/";
  } else {
    console.error("Wystąpił błąd podczas wylogowywania", error);
  }
});

async function main() {
  const [
    { data: articles, error },
    {
      data: { session },
    },
  ] = await Promise.all([
    supabase
      .from("article")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.auth.getSession(),
  ]);

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  const articlesContainer = document.querySelector(".articles");

  const articlesList = articles
    .map(
      (article) => `
  <article class="article py-6 border-b-10 border-pagebg bg-secondary/50 rounded p-6 grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-x-3 gap-y-2" data-id="${
    article.id
  }">
    <div class="col-start-2 row-start-1">
      <h2 class="text-xl font-semibold">${article.title}</h2>
      <h3 class="mt-2">${article.subtitle || ""}</h3>
      <div class="text-sm text-black/70 mt-2">
        <address class="not-italic mt-1.5" rel="author">${
          article.author
        }</address>
        <time datetime="${article.created_at}">${new Date(
        article.created_at
      ).toLocaleDateString()}</time>
        <p class="mb-4 mt-1.5 whitespace-pre-wrap">${article.content}</p>
      </div>
    </div>
    <div class="col-start-2 row-start-2 flex space-x-2">
      ${
        session
          ? `<button class="transition-transform duration-300 hover:scale-102 edit-button bg-primary hover:bg-hovering px-3 py-1 rounded text-primarytext cursor-pointer">Edit</button>
      <button class="transition-transform duration-300 hover:scale-102 delete-button bg-secondary text-primarytext px-3 py-1 rounded hover:bg-hoverings cursor-pointer">Delete</button>`
          : ""
      }
    </div>
  </article>
`
    )
    .join("\n");

  articlesContainer.innerHTML = articlesList;
}

main();

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-button")) {
    const articleEl = e.target.closest(".article");
    const id = articleEl.dataset.id;

    const { data: article, error } = await supabase
      .from("article")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch the article", error);
      return;
    }

    document.getElementById("edit-id").value = article.id;
    document.getElementById("edit-title").value = article.title;
    document.getElementById("edit-subtitle").value = article.subtitle;
    document.getElementById("edit-content").value = article.content;
    document.getElementById("edit-author").value = article.author;

    editModal.showModal();
  }
});

document.getElementById("cancel-edit").addEventListener("click", () => {
  editModal.close();
});

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const title = document.getElementById("edit-title").value;
  const subtitle = document.getElementById("edit-subtitle").value;
  const content = document.getElementById("edit-content").value;
  const author = document.getElementById("edit-author").value;
  const updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("article")
    .update({ title, subtitle, content, author, created_at: updated_at })
    .eq("id", id);

  if (error) {
    console.error("Failed to update the article", error);
    return;
  }

  editModal.close();
  main();
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-button")) {
    const articleEl = e.target.closest(".article");
    const id = articleEl.dataset.id;

    const confirmed = confirm("Are you sure you want to delete this article?");

    if (!confirmed) return;

    const { error } = await supabase.from("article").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete the article", error);
      return;
    }

    main();
  }
});

const addButton = document.getElementById("add-article-button");
const addModal = document.getElementById("add-modal");
const editModal = document.getElementById("edit-modal");

addButton.addEventListener("click", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login/";
    return;
  }

  addModal.showModal();
});

document.getElementById("cancel-add").addEventListener("click", () => {
  addModal.close();
});

document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("add-title").value;
  const subtitle = document.getElementById("add-subtitle").value;
  const content = document.getElementById("add-content").value;
  const author = document.getElementById("add-author").value;
  const created_at = new Date().toISOString();

  const { error } = await supabase
    .from("article")
    .insert([{ title, subtitle, content, author, created_at }]);

  if (error) {
    console.error("Failed to add the article", error);
    return;
  }

  addModal.close();
  document.getElementById("add-form").reset();
  main();
});

addModal.addEventListener("click", (e) => {
  const form = addModal.querySelector("form");
  if (!form.contains(e.target)) {
    addModal.close();
  }
});

editModal.addEventListener("click", (e) => {
  const form = editModal.querySelector("form");
  if (!form.contains(e.target)) {
    editModal.close();
  }
});
