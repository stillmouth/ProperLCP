const { ipcRenderer } = require("electron");
const { attachContextMenu } = require("./contextMenu");
const { deleteOrder } = require("./deleteOrder");
const { exportTableToExcel } = require("./export");
const  {createTextPopup} = require("./textPopup");

let currentSortByCategoryWise = null;
let currentSortOrderCategoryWise = "asc";

// Modified fetchCategories function to handle both dropdown population and initial fetch
function fetchCategories() {
    return new Promise((resolve) => {
        ipcRenderer.send("get-categories-event");
        ipcRenderer.once("categories-response", (event, data) => {
            const categoryDropdown = document.getElementById("categoryDropdown");
            
            // Clear and populate dropdown
            categoryDropdown.innerHTML = `<option value="">Select Category</option>`;
            
            if (data.categories.length > 0) {
                data.categories.forEach(category => {
                    let option = document.createElement("option");
                    option.value = category.catid;
                    option.textContent = category.catname;
                    categoryDropdown.appendChild(option);
                });

                // Resolve with the categories data
                resolve(data.categories);
            } else {
                resolve([]);
            }
        });
    });
}

// Updated loadCategoryHistory function
async function loadCategoryHistory(mainContent, billPanel) {
    // Apply margins and hide bill panel
    mainContent.style.marginLeft = "200px";
    mainContent.style.marginRight = "0px";
    billPanel.style.display = 'none';

    const today = new Date().toISOString().split("T")[0];

    mainContent.innerHTML = `
        <div class="category-history-header">
            <h1>Category Wise Sales</h1>
            <div class="date-filters">
                <label for="categoryStartDate">Start Date:</label>
                <input type="date" id="categoryStartDate" value="${today}">
                
                <label for="categoryEndDate">End Date:</label>
                <input type="date" id="categoryEndDate" value="${today}">
                
                <select id="categoryDropdown"></select>
                <button class="showHistoryButton">Show History</button>
                <button id="exportExcelButton">Export to Excel</button>
            </div>
        </div>
        <div id="categoryWiseDiv"></div>
    `;

    // Load saved filters from sessionStorage
    const savedStartDate = sessionStorage.getItem("categoryWiseStartDate");
    const savedEndDate = sessionStorage.getItem("categoryWiseEndDate");
    const savedCategory = sessionStorage.getItem("categoryWiseCategory");

    if (savedStartDate) document.getElementById("categoryStartDate").value = savedStartDate;
    if (savedEndDate) document.getElementById("categoryEndDate").value = savedEndDate;

    // Set up event listeners
    document.querySelector(".showHistoryButton").addEventListener("click", () => {
        fetchCategoryWise();
    });

    // Fetch categories and handle initial data load
    try {
        const categories = await fetchCategories();
        
        if (savedCategory) {
            document.getElementById("categoryDropdown").value = savedCategory;
            fetchCategoryWise(savedStartDate || today, savedEndDate || today, savedCategory);
        } else if (categories.length > 0) {
            // Use first category as default if none saved
            const defaultCategory = categories[0].catid;
            document.getElementById("categoryDropdown").value = defaultCategory;
            fetchCategoryWise(today, today, defaultCategory);
        }
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function fetchCategoryWise(startDate = null, endDate = null, category = null) {
    // Use function parameters if available; otherwise, get values from inputs
    if (!startDate) startDate = document.getElementById("categoryStartDate").value;
    if (!endDate) endDate = document.getElementById("categoryEndDate").value;
    if (!category) category = document.getElementById("categoryDropdown").value;

    if (!startDate || !endDate) {
        createTextPopup("Please select both start and end dates.");
        return;
    }

    if (!category) {
        createTextPopup("Please select a category.");
        return;
    }

    // Store selected filters in sessionStorage
    sessionStorage.setItem("categoryWiseStartDate", startDate);
    sessionStorage.setItem("categoryWiseEndDate", endDate);
    sessionStorage.setItem("categoryWiseCategory", category);

    // Send request to fetch fresh category-wise sales data
    ipcRenderer.send("get-category-wise", { startDate, endDate, category });
}


// Function to display category-wise sales table
function displayCategoryWiseSales(orders) {
    const orderHistoryDiv = document.getElementById("categoryWiseDiv");
    orderHistoryDiv.innerHTML = ""; // Clear previous content

    if (orders.length === 0) {
         orderHistoryDiv.innerHTML = `
            <div style="text-align: center; font-family: 'Arial', sans-serif; background-color: #f5f5f5; color: #333; display: flex; justify-content: center; align-items: center; height: 78vh; margin: 0;">
                <div>
                    <div style="font-size: 72px; font-weight: bold; margin-bottom: 20px;">
                        No Orders Found!
                    </div>
                </div>
            </div>
        `;
        document.getElementById('goHomeButton').addEventListener('click', function () {
            document.getElementById('Home').click();
        });
        return;
    }

    orders.sort((a, b) => sortData(a, b, currentSortByCategoryWise, currentSortOrderCategoryWise));

    // Create a table
    let tableHTML = `
        <table class="order-history-table">
            <thead>
                <tr>
                    <th class="sortable" onclick="sortCategoryWiseTable('billno')">Bill No ${getSortIndicatorCategoryWise('billno')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('date')">Date ${getSortIndicatorCategoryWise('date')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('cashier_name')">Cashier ${getSortIndicatorCategoryWise('cashier_name')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('kot')">KOT ${getSortIndicatorCategoryWise('kot')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('price')">Price (₹) ${getSortIndicatorCategoryWise('price')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('sgst')">SGST (₹) ${getSortIndicatorCategoryWise('sgst')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('cgst')">CGST (₹) ${getSortIndicatorCategoryWise('cgst')}</th>
                    <th class="sortable" onclick="sortCategoryWiseTable('tax')">Tax (₹) ${getSortIndicatorCategoryWise('tax')}</th>
                    <th>Food Items</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        tableHTML += `
            <tr data-billno="${order.billno}">
                <td>${order.billno}</td>
                <td class="date-column">${formatDate(order.date)}</td>
                <td>${order.cashier_name}</td>
                <td>${order.kot}</td>
                <td>${order.price.toFixed(2)}</td>
                <td>${order.sgst.toFixed(2)}</td>
                <td>${order.cgst.toFixed(2)}</td>
                <td>${order.tax.toFixed(2)}</td>
                <td>${order.food_items || "No items"}</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    orderHistoryDiv.innerHTML = tableHTML;

    // ✅ Store the fetched category-wise sales in sessionStorage
    sessionStorage.setItem("categoryWiseData", JSON.stringify(orders));

    attachContextMenu(".order-history-table");

    // Attach export button functionality
    setTimeout(() => {
        document.getElementById("exportExcelButton").addEventListener("click", () => {
            exportTableToExcel(".order-history-table");
        });
    }, 100);
}

// ✅ Store category-wise sales data and display it
ipcRenderer.on("category-wise-response", (event, data) => {
    displayCategoryWiseSales(data.orders);
});

ipcRenderer.on("refresh-order-history", () => {
    console.log("Refreshing category-wise sales after deletion...");

    const startDate = sessionStorage.getItem("categoryWiseStartDate");
    const endDate = sessionStorage.getItem("categoryWiseEndDate");
    const category = sessionStorage.getItem("categoryWiseCategory");

    if (startDate && endDate && category) {
        ipcRenderer.send("get-category-wise", { startDate, endDate, category });
    }
});

function sortCategoryWiseTable(column) {
    currentSortByCategoryWise = column;
    currentSortOrderCategoryWise = currentSortOrderCategoryWise === "asc" ? "desc" : "asc";

    // Get the existing data from sessionStorage and sort it
    let orders = JSON.parse(sessionStorage.getItem("categoryWiseData") || "[]");

    if (orders.length > 0) {
        orders.sort((a, b) => sortData(a, b, currentSortByCategoryWise, currentSortOrderCategoryWise));
        displayCategoryWiseSales(orders); // Redisplay sorted data
    }
}

// Function to parse a formatted date (dd-mm-yy) into a Date object
function parseFormattedDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return new Date(`20${year}-${month}-${day}`); // Convert to yyyy-mm-dd format
}


function sortData(a, b, key, order) {
    if (!a[key] || !b[key]) return 0; // Handle undefined/null values

    if (typeof a[key] === "string") {
        return order === "asc" ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
    } else {
        return order === "asc" ? a[key] - b[key] : b[key] - a[key];
    }
}

function getSortIndicatorCategoryWise(column) {
    if (currentSortByCategoryWise === column) {
        return currentSortOrderCategoryWise === "asc" ? "▲" : "▼";
    }
    return "";
}

// Function to format date from yyyy-mm-dd to dd-mm-yy
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year
    return `${day}-${month}-${year}`;
}

// Export functions
module.exports = { fetchCategoryWise, displayCategoryWiseSales, sortCategoryWiseTable, loadCategoryHistory };