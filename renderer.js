const { ipcRenderer } = require('electron');
const { updateCategoryPanel } = require("./categoryHandler");
const { fetchOrderHistory } = require("./history");
const { fetchDeletedOrders } = require("./deletedOrdersTable");
const { fetchCategoryWise } = require("./categoryWiseTable");
const { fetchCategories } = require("./categoryDropDown");
const { fetchTodaysOrders } = require("./todaysOrders");
const { exportTableToExcel } = require("./export"); 
const {confirmDeleteCategory} = require("./categoriesList");
const {openEditWindow} = require("./categoriesList");
const {displayOrderHistory} = require("./history");
const { displayCategoryWiseSales } = require("./categoryWiseTable");
const { displayDeletedOrders } = require("./deletedOrdersTable");
const { loadUserProfile } = require("./userProfile");
window.fetchOrderHistory = fetchOrderHistory;
window.updateCategoryPanel = updateCategoryPanel;
window.fetchDeletedOrders = fetchDeletedOrders;
window.fetchCategoryWise = fetchCategoryWise;
window.fetchCategories = fetchCategories;
window.fetchTodaysOrders = fetchTodaysOrders;
window.exportTableToExcel = exportTableToExcel;
window.fetchCategoriesList = fetchCategoriesList;
window.confirmDeleteCategory = confirmDeleteCategory;
window.openEditWindow = openEditWindow;
window.displayOrderHistory = displayOrderHistory;
window.displayCategoryWiseSales = displayCategoryWiseSales;
window.displayDeletedOrders = displayDeletedOrders;

// Listen for the 'set-user-role' message from the main process
ipcRenderer.on('set-user-role', (event, role) => {
    const content = document.getElementById('content'); // Assuming this is the main container
    if (content) {
        content.classList.add('fade-in');
        console.log(`Received role: ${role}`);
        const billPanel = document.getElementById("bill-panel");
        billPanel.style.display = 'none';
        if (role === 'staff') {
            console.log("Hiding buttons for staff via 'set-user-role'");
            document.getElementById('Analytics').style.display = 'none';
            document.getElementById('History').style.display = 'none';
        }
    }
});

ipcRenderer.on("delete-order-response", (event, data) => {
    alert(data.message);
    if (data.success) {
        fetchOrderHistory(); // Refresh the order list
    }
});
