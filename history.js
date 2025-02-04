const { ipcRenderer } = require("electron");
const XLSX = require("xlsx");

function fetchOrderHistory() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    ipcRenderer.send("get-order-history", { startDate, endDate });
}

// Listen for order history response and update UI
ipcRenderer.on("order-history-response", (event, data) => {
    const orderHistoryDiv = document.getElementById("orderHistoryDiv");
    orderHistoryDiv.innerHTML = ""; // Clear previous content

    if (!data.success || data.orders.length === 0) {
        orderHistoryDiv.innerHTML = "<p>No orders found for the selected date range.</p>";
        return;
    }

    let tableHTML = `
        <table class="order-history-table">
            <thead>
                <tr>
                    <th>Bill No</th>
                    <th>Date</th>
                    <th>Cashier</th>
                    <th>KOT</th>
                    <th>Price (₹)</th>
                    <th>SGST (₹)</th>
                    <th>CGST (₹)</th>
                    <th>Tax (₹)</th>
                    <th>Food Items</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.orders.forEach(order => {
        tableHTML += `
            <tr>
                <td>${order.billno}</td>
                <td>${order.date}</td>
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
});

function exportToExcel() {
    const table = document.querySelector(".order-history-table");
    if (!table) {
        ipcRenderer.send("show-excel-export-message", {
            type: "warning",
            title: "Export Failed",
            message: "No data available to export.",
        });
        return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(workbook, worksheet, "OrderHistory");

    const filename = "Order_History.xlsx";
    XLSX.writeFile(workbook, filename);

    ipcRenderer.send("show-excel-export-message", {
        type: "info",
        title: "Export Successful",
        message: `✅ Export successful! File saved as: ${filename}\nCheck the project folder.`,
    });
}

// Export functions so they can be used in renderer.js
module.exports = { fetchOrderHistory, exportToExcel };
