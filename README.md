# Library Management System

A responsive, browser-based Library Management System built with **HTML, CSS, and vanilla JavaScript**. It lets users maintain a small book catalog, search the collection, and track whether books are available or issued.

## Live Demo

After enabling GitHub Pages, add your published URL here.

## Features

- **Dashboard statistics** — total books, available books, and issued books.
- **Add books** — capture title, author, category, and a unique Book ID / ISBN.
- **Search** — find books by title, author, or Book ID.
- **Filter by status** — view all, available, or issued books.
- **Issue and return** — toggle a book's availability and see the dashboard update.
- **Delete books** — remove a book after confirming the action.
- **Persistent browser storage** — book records are stored in `localStorage` and remain after refresh.
- **Responsive layout** — adapts to desktop, tablet, and mobile screens.
- **Input validation** — required fields and duplicate Book IDs are checked.

## Tech Stack

- HTML5
- CSS3 (responsive layout and media queries)
- Vanilla JavaScript (DOM manipulation, events, array methods)
- Browser `localStorage`

## Getting Started

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Start adding, searching, issuing, returning, and deleting books.

No package installation, build step, framework, or backend is required.

## Project Structure

```text
library-management-system/
├── index.html       # Application structure
├── styles.css       # Styling and responsive layout
├── script.js        # Book management logic and localStorage
├── README.md        # Project documentation
└── .gitignore       # Common files to exclude from Git
```

## How It Works

The application stores books as JavaScript objects in an array. Whenever the collection changes, the array is serialized to JSON and saved to `localStorage`. On page load, saved data is loaded back into the application. If no saved data exists, a small sample collection is provided.

## Important Limitation

This is a **front-end demonstration project**. `localStorage` is specific to the current browser and device; it does not provide multi-user access, authentication, or server-side storage. Issuing a book updates its status only — it does not record borrower details or due dates.

## Manual Test Checklist

- [ ] Add a book with all required fields.
- [ ] Try adding another book with the same Book ID.
- [ ] Search by title, author, and Book ID.
- [ ] Filter by Available and Issued.
- [ ] Issue a book and then return it.
- [ ] Delete a book and cancel a deletion once.
- [ ] Refresh the page and confirm changes remain.
- [ ] Check the layout at desktop and mobile widths.

## Future Improvements

- Borrower details and issue/return dates
- Due-date reminders and overdue tracking
- Edit book details
- Backend and database integration
- Login and role-based access

## Author

**Abhay B Sharma**

Built as a portfolio project to practice front-end web development, DOM manipulation, form validation, and browser storage.
