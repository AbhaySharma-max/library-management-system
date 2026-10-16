(() => {
  "use strict";

  const STORAGE_KEY = "libraryHubBooks_v1";
  const SEED_BOOKS = [
    { id: "seed-1", title: "Wings of Fire", author: "A. P. J. Abdul Kalam", category: "Biography", bookCode: "BK-101", issued: false },
    { id: "seed-2", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", bookCode: "BK-102", issued: true },
    { id: "seed-3", title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", bookCode: "BK-103", issued: false },
    { id: "seed-4", title: "Clean Code", author: "Robert C. Martin", category: "Technology", bookCode: "BK-104", issued: false }
  ];

  const $ = (selector) => document.querySelector(selector);
  const form = $("#bookForm");
  const titleInput = $("#title");
  const authorInput = $("#author");
  const categoryInput = $("#category");
  const codeInput = $("#bookCode");
  const searchInput = $("#searchInput");
  const statusFilter = $("#statusFilter");
  const bookList = $("#bookList");
  const emptyState = $("#emptyState");
  const formMessage = $("#formMessage");
  const toast = $("#toast");
  const deleteDialog = $("#deleteDialog");
  const deleteMessage = $("#deleteMessage");
  let pendingDeleteId = null;
  let toastTimeout;

  function loadBooks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BOOKS));
        return [...SEED_BOOKS];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) throw new Error("Saved data is not a list.");
      return parsed.filter((book) =>
        book && typeof book.id === "string" &&
        typeof book.title === "string" &&
        typeof book.author === "string" &&
        typeof book.bookCode === "string" &&
        typeof book.issued === "boolean"
      );
    } catch (error) {
      console.error("Could not load library data:", error);
      showToast("Saved data could not be read. Your current session is still usable.");
      return [...SEED_BOOKS];
    }
  }

  let books = loadBooks();

  function saveBooks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      return true;
    } catch (error) {
      console.error("Could not save library data:", error);
      showToast("Could not save changes. Check your browser storage settings.");
      return false;
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function setFormMessage(message, type = "success") {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  }

  function updateStats() {
    $("#totalBooks").textContent = books.length;
    $("#availableBooks").textContent = books.filter((book) => !book.issued).length;
    $("#issuedBooks").textContent = books.filter((book) => book.issued).length;
    $("#bookCount").textContent = books.length;
  }

  function makeCell(className = "") {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    return cell;
  }

  function renderBooks() {
    updateStats();
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filter = statusFilter.value;
    const visibleBooks = books.filter((book) => {
      const matchesQuery = book.title.toLocaleLowerCase().includes(query) ||
        book.author.toLocaleLowerCase().includes(query) ||
        book.bookCode.toLocaleLowerCase().includes(query);
      const matchesStatus = filter === "all" ||
        (filter === "issued" && book.issued) ||
        (filter === "available" && !book.issued);
      return matchesQuery && matchesStatus;
    });

    bookList.replaceChildren();
    visibleBooks.forEach((book, index) => {
      const row = document.createElement("tr");

      const detailsCell = makeCell();
      const details = document.createElement("div");
      details.className = "book-title";
      const cover = document.createElement("span");
      cover.className = `book-cover cover-${index % 5}`;
      cover.setAttribute("aria-hidden", "true");
      cover.textContent = "▤";
      const textWrap = document.createElement("span");
      textWrap.append(document.createTextNode(book.title));
      const author = document.createElement("span");
      author.className = "book-author";
      author.textContent = `by ${book.author}`;
      textWrap.appendChild(author);
      details.append(cover, textWrap);
      detailsCell.appendChild(details);
      row.appendChild(detailsCell);

      const categoryCell = makeCell();
      const category = document.createElement("span");
      category.className = "category-tag";
      category.textContent = book.category || "Other";
      categoryCell.appendChild(category);
      row.appendChild(categoryCell);

      const codeCell = makeCell();
      codeCell.textContent = book.bookCode;
      row.appendChild(codeCell);

      const statusCell = makeCell();
      const status = document.createElement("span");
      status.className = `status ${book.issued ? "issued" : "available"}`;
      status.textContent = book.issued ? "Issued" : "Available";
      statusCell.appendChild(status);
      row.appendChild(statusCell);

      const actionsCell = makeCell();
      const actions = document.createElement("div");
      actions.className = "row-actions";
      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "action-btn";
      toggleButton.textContent = book.issued ? "Return" : "Issue";
      toggleButton.setAttribute("aria-label", `${book.issued ? "Return" : "Issue"} ${book.title}`);
      toggleButton.addEventListener("click", () => toggleBookStatus(book.id));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-btn delete";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete ${book.title}`);
      deleteButton.addEventListener("click", () => openDeleteDialog(book.id));

      actions.append(toggleButton, deleteButton);
      actionsCell.appendChild(actions);
      row.appendChild(actionsCell);
      bookList.appendChild(row);
    });

    emptyState.hidden = visibleBooks.length !== 0;
    $(".table-wrap").hidden = visibleBooks.length === 0;
    $("#resultsText").textContent = `Showing ${visibleBooks.length} of ${books.length} ${books.length === 1 ? "book" : "books"}`;
  }

  function toggleBookStatus(id) {
    const book = books.find((item) => item.id === id);
    if (!book) return;
    book.issued = !book.issued;
    if (!saveBooks()) return;
    renderBooks();
    showToast(`"${book.title}" marked as ${book.issued ? "issued" : "returned"}.`);
  }

  function openDeleteDialog(id) {
    const book = books.find((item) => item.id === id);
    if (!book) return;
    pendingDeleteId = id;
    deleteMessage.textContent = `"${book.title}" will be permanently removed from this browser's library list.`;
    deleteDialog.showModal();
  }

  $("#confirmDelete").addEventListener("click", (event) => {
    event.preventDefault();
    if (!pendingDeleteId) return;
    const deletedBook = books.find((item) => item.id === pendingDeleteId);
    const previousBooks = books;
    books = books.filter((item) => item.id !== pendingDeleteId);
    if (!saveBooks()) {
      books = previousBooks;
      deleteDialog.close();
      renderBooks();
      return;
    }
    deleteDialog.close();
    pendingDeleteId = null;
    renderBooks();
    showToast(deletedBook ? `"${deletedBook.title}" deleted.` : "Book deleted.");
  });

  deleteDialog.addEventListener("close", () => { pendingDeleteId = null; });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const category = categoryInput.value;
    const bookCode = codeInput.value.trim();

    if (!title || !author || !bookCode) {
      setFormMessage("Please complete all required fields.", "error");
      return;
    }

    const duplicate = books.some((book) =>
      book.bookCode.toLocaleLowerCase() === bookCode.toLocaleLowerCase()
    );
    if (duplicate) {
      setFormMessage("That Book ID / ISBN is already in use. Please enter a unique ID.", "error");
      codeInput.focus();
      return;
    }

    const newBook = {
      id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      author,
      category,
      bookCode,
      issued: false
    };
    books.unshift(newBook);
    if (!saveBooks()) {
      books = books.filter((book) => book.id !== newBook.id);
      return;
    }

    form.reset();
    searchInput.value = "";
    statusFilter.value = "all";
    setFormMessage(`"${title}" was added to your collection.`, "success");
    renderBooks();
    showToast("Book added successfully.");
    titleInput.focus();
  });

  searchInput.addEventListener("input", renderBooks);
  statusFilter.addEventListener("change", renderBooks);

  renderBooks();
})();
