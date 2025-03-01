const { ipcRenderer } = require("electron");

function fetchCategoriesList() {
    ipcRenderer.send("get-categories-list");
}

// Receive categories from the main process and update the UI
ipcRenderer.on("categories-list-response", (event, data) => {
    const categories = data.categories;
    const categoriesTabDiv = document.getElementById("categoriesTabDiv");
    categoriesTabDiv.innerHTML = ""; // Clear previous content

    if (categories.length === 0) {
        categoriesTabDiv.innerHTML = "<p>No categories found.</p>";
        return;
    }

    // Create a table to display categories
    let tableHTML = `
        <table class="order-history-table">
            <thead>
                <tr>
                    <th>Category ID</th>
                    <th>Category Name</th>
                    <th>Active</th>
                    <th>Remove</th>
                    <th>Edit</th> 
                </tr>
            </thead>
            <tbody>
    `;

    categories.forEach(category => {
        tableHTML += `
            <tr>
                <td>${category.catid}</td>
                <td>${category.catname}</td>
                <td>${category.active === 1 ? "✅ Active" : "❌ Inactive"}</td>
                <td>
                    <button class="remove-btn" onclick="confirmDeleteCategory(${category.catid})">➖</button>
                </td>
                <td>
                    <button class="edit-btn" onclick="openEditWindow(${category.catid}, '${category.catname}', ${category.active})">✏️</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    categoriesTabDiv.innerHTML = tableHTML;
});

// Open edit category window by sending an IPC event to main.js
function openEditWindow(catid, catname, active) {
    ipcRenderer.send("open-edit-category-window", { catid, catname, active });
}


// Function to confirm and delete category
function confirmDeleteCategory(categoryId) {
    if (confirm("Are you sure you want to delete this category?")) {
        ipcRenderer.send("delete-category", categoryId);
    }
}



// Refresh the category list after deletion or update
ipcRenderer.on("category-deleted", () => {
    fetchCategoriesList();
});

ipcRenderer.on("category-updated", () => {
    fetchCategoriesList();
});

// Export function so it can be used in `renderer.js`
module.exports = { fetchCategoriesList, confirmDeleteCategory, openEditWindow };
