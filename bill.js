// Add an item to the bill
function addToBill(itemId, itemName, price, quantity) {
    if (quantity > 0) {
        const totalPrice = price * quantity;
        const billItemsList = document.getElementById("bill-items-list");

        let existingItem = document.getElementById(`bill-item-${itemId}`);
        if (existingItem) {
            const quantityInput = existingItem.querySelector(".bill-quantity");
            const totalPriceCell = existingItem.querySelector(".bill-total");
            let newQuantity = parseInt(quantityInput.value) + quantity;
            quantityInput.value = newQuantity;
            totalPriceCell.textContent = (price * newQuantity).toFixed(2);
        } else {
            // Create row for bill item
            const billItemRow = document.createElement("div");
            billItemRow.classList.add("bill-item");
            billItemRow.id = `bill-item-${itemId}`;

            // Item Name
            const itemNameSpan = document.createElement("span");
            itemNameSpan.classList.add("bill-item-name");
            itemNameSpan.textContent = itemName;

            // Quantity Controls (input field)
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.classList.add("bill-quantity");
            quantityInput.value = quantity;
            quantityInput.min = 1;
            quantityInput.addEventListener("input", () => updateQuantityInput(itemId, price));

            // Price (with "x" before it)
            const timesSpan = document.createElement("span");
            timesSpan.textContent = " x ";

            const priceSpan = document.createElement("span");
            priceSpan.classList.add("bill-price");
            priceSpan.textContent = price.toFixed(2);

            // Equals Sign
            const equalsSpan = document.createElement("span");
            equalsSpan.textContent = " = ";

            // Total Price
            const totalSpan = document.createElement("span");
            totalSpan.classList.add("bill-total");
            totalSpan.textContent = totalPrice.toFixed(2);

            // Remove Button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.onclick = () => removeFromBill(itemId);

            // Append everything in the correct order
            billItemRow.append(itemNameSpan, quantityInput, timesSpan, priceSpan, equalsSpan, totalSpan, removeBtn);

            // Add to bill
            billItemsList.appendChild(billItemRow);
        }

        updateBillTotal();
    } else {
        alert('Please select a quantity greater than 0 to add to the bill.');
    }
}

function updateQuantityInput(itemId, price) {
    let itemRow = document.getElementById(`bill-item-${itemId}`);
    if (!itemRow) return;

    let quantityInput = itemRow.querySelector(".bill-quantity");
    let totalPriceSpan = itemRow.querySelector(".bill-total");

    let newQuantity = Math.max(1, parseInt(quantityInput.value) || 1);
    quantityInput.value = newQuantity;
    totalPriceSpan.textContent = (price * newQuantity).toFixed(2);

    updateBillTotal();
}

// Function to remove an item from the bill
// Function to remove an item from the bill
function removeFromBill(itemId) {
    const billItem = document.getElementById(`bill-item-${itemId}`);
    if (billItem) {
        billItem.remove();
        updateBillTotal();
    }
}

// Function to reset the bill by removing all items
function resetBill() {
    const billItemsList = document.getElementById("bill-items-list");
    // Clear all items from the bill
    billItemsList.innerHTML = '';

    // Reset total display
    document.getElementById("total-amount").textContent = "Total: Rs. 0.00 (Your bill is empty)";

    // Reset discount display
    document.getElementById("discount-applied-display").textContent = "Discount: ₹0.00";

    // Remove or reset the discount fields
    let discountField = document.getElementById("discounted-total");
    if (discountField) {
        discountField.value = 0;
    }

    let discountPercentageInput = document.getElementById("discount-percentage");
    let discountAmountInput = document.getElementById("discount-amount");
    if (discountPercentageInput) {
        discountPercentageInput.value = "";
    }
    if (discountAmountInput) {
        discountAmountInput.value = "";
    }

    // Update the total bill amount
    updateBillTotal();
}


// Function to apply the discount
function applyDiscount() {
    let discountPercentage = parseFloat(document.getElementById("discount-percentage").value) || 0;
    let discountAmount = parseFloat(document.getElementById("discount-amount").value) || 0;
    let totalAmount = 0;

    const billItems = document.querySelectorAll(".bill-item");

    // Calculate total before applying discount
    billItems.forEach(item => {
        let amount = parseFloat(item.querySelector(".bill-total").textContent);
        if (!isNaN(amount)) {
            totalAmount += amount;
        }
    });

    // Ensure previous discount is cleared before applying a new one
    let discountField = document.getElementById("discounted-total");
    if (discountField) {
        discountField.value = totalAmount; // Reset before applying a new discount
    }

    if (discountPercentage < 0 || discountAmount < 0) {
        alert("Discount cannot be negative.");
        return;
    }

    if (discountPercentage > 0 && discountAmount > 0) {
        alert("Please apply either a percentage discount OR a fixed amount discount, not both.");
        return;
    }

    if (discountAmount > totalAmount) {
        alert("Discount amount cannot exceed the total bill amount.");
        return;
    }

    // Apply discount
    let discountedTotal = totalAmount;
    if (discountPercentage > 0) {
        discountedTotal -= totalAmount * (discountPercentage / 100);
    } else if (discountAmount > 0) {
        discountedTotal -= discountAmount;
    }

    discountedTotal = Math.max(0, discountedTotal); // Prevent negative total

    // Store discounted total properly
    if (!discountField) {
        discountField = document.createElement("input");
        discountField.type = "hidden";
        discountField.id = "discounted-total";
        document.body.appendChild(discountField);
    }
    discountField.value = discountedTotal;

    // Update displayed total
    const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(discountedTotal);
    
    document.getElementById("total-amount").textContent = `Total: ${formattedTotal}`;
    
    let discountValue = totalAmount - discountedTotal; // Calculate applied discount
    const formattedDiscount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(discountValue);
    
    document.getElementById("discount-applied-display").textContent = `Discount: ${formattedDiscount}`;
    
}




// Function to update the total amount of the bill
function updateBillTotal() {
    const billItemsList = document.getElementById("bill-items-list");
    let totalAmount = 0;

    const billItems = billItemsList.getElementsByClassName("bill-item");
    for (let item of billItems) {
        const totalPrice = parseFloat(item.querySelector(".bill-total").textContent);
        totalAmount += totalPrice;
    }

    const totalElement = document.getElementById("total-amount");
    const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(totalAmount);

    if (billItems.length === 0) {
        totalElement.textContent = 'Total: Rs. 0.00 (Your bill is empty)';
    } else {
        totalElement.textContent = `Total: ${formattedTotal}`;
    }
}


// Function to save and print the bill
function saveAndPrintBill() {
    const cashier = 1; // Replace with actual cashier ID
    const date = new Date().toISOString().split("T")[0];

    const billItems = document.querySelectorAll(".bill-item");
    let orderItems = [];
    let totalAmount = 0;

    billItems.forEach(item => {
        let foodId = item.id.replace("bill-item-", ""); // Extract item ID
        let quantity = parseInt(item.querySelector(".bill-quantity").value);
        let itemTotal = parseFloat(item.querySelector(".bill-total").textContent);
        if (!isNaN(itemTotal)) {
            totalAmount += itemTotal;
        }
        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    if (orderItems.length === 0) {
        createTextPopup("No items in the bill. Please add items before proceeding.");
        return;
    }

    // Check if a discounted total exists, otherwise use the original totalAmount
    let discountField = document.getElementById("discounted-total");
    let discountedTotal = discountField && discountField.value ? parseFloat(discountField.value) : totalAmount;

    // Send order data to main process with discount applied (or not)
    ipcRenderer.send("save-bill", { cashier, date, orderItems, totalAmount: discountedTotal });

    // Add the glow effect to the bill panel
    const billPanel = document.getElementById("bill-panel");
    billPanel.classList.add("glow");

    // Remove the glow effect after 2 seconds
    setTimeout(() => {
        billPanel.classList.remove("glow");
    },800);

    NewOrder();
}

//---------------------------------------------------------------------------------------------------------------------------

function holdBill() {
    // Get cashier ID (Assume it's set somewhere in the UI)
    const cashier = 1; // Replace with actual cashier ID

    // Get current date in YYYY-MM-DD format
    const date = new Date().toISOString().split("T")[0];

    // Get all bill items
    const billItems = document.querySelectorAll(".bill-item");
    let orderItems = [];

    billItems.forEach(item => {
        let foodId = item.id.replace("bill-item-", ""); // Extract item ID
        let quantity = parseInt(item.querySelector(".bill-quantity").textContent);

        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    if (orderItems.length === 0) {
        createTextPopup("No items in the bill. Please add items before proceeding.");
        return;
    }

    // Send order data to main process
    ipcRenderer.send("hold-bill", { cashier, date, orderItems });

    // Show confirmation popup instead of alert
    createTextPopup("Bill put on hold!");

    NewOrder();
}
// Function to toggle the visibility of the discount inputs and apply button
function toggleDiscountPopup() {
    let existingPopup = document.getElementById("discount-popup");
    if (existingPopup) {
        existingPopup.remove();
        return;
    }

    const popup = document.createElement("div");
    popup.id = "discount-popup";
    popup.classList.add("edit-popup");

    popup.innerHTML = `
        <div class="popup-content" style="align-items: center; justify-content: center; width: 300px; pointer-events: auto;">
            <h3>Apply Discount</h3>
            
            <label for="discount-percentage">Discount Percentage:</label>
            <input type="number" id="discount-percentage" placeholder="Enter discount %" min="0" max="100" style="width: 75%;">

            <label for="discount-amount">Fixed Discount (Rs.):</label>
            <input type="number" id="discount-amount" placeholder="Enter discount amount" min="0" style="width: 75%;">

            <br>

            <div class="popup-buttons">
                <button id="apply-discount-btn" style="margin-right: 10px; width: 90px; height: 40px;">Apply</button>
                <button id="closePopup" style="width: 90px; height: 40px;">Cancel</button>

            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Add event listener for closing popup
    document.getElementById("closePopup").addEventListener("click", () => {
        popup.remove();
    });

    // Add event listener for applying discount and closing popup
    document.getElementById("apply-discount-btn").addEventListener("click", () => {
        console.log("Apply button clicked!"); // Debugging
        applyDiscount(); // Call the discount function
        popup.remove(); // Close the popup
        
    });
}

function displayHeld() {
    let existingPopup = document.getElementById("heldpopup");

    if (existingPopup) {
        existingPopup.remove();
        return;
    }

    ipcRenderer.send('get-held-orders'); // Request held orders from the main process
}

ipcRenderer.on('held-orders-data', (event, heldOrders) => {
    let popup = document.createElement("div");
    popup.id = "heldpopup";
    popup.classList.add("edit-popup");

    let popupContent = `
        <div class="popup-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 850px;">
            <div style="width: 100%; display: flex; justify-content: flex-end;">
                <span class="close-btn" onclick="closeHeldPopup()" style="cursor: pointer; font-size: 20px; font-weight: bold;">&times;</span>
            </div>
            <h3>Held Orders</h3>
            <div class="custom-scrollbar" style="max-height: 550px; overflow-y: auto; width: 100%; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
    `;

    heldOrders.forEach(order => {
        let itemsArray = order.food_items ? order.food_items.split(", ") : ["No items"];
        let itemsGrid = "";

        itemsArray.forEach(item => {
            itemsGrid += `<div style="padding: 2px; border: 1px solid #ddd; font-size: 12px; text-align: center; flex-basis: 48%; height: 30px; display: flex; justify-content: center; align-items: center;">${item}</div>`;
        });

        popupContent += `
            <div style="border: 2px solid #333; width: 350px; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); height: 250px; display: flex; flex-direction: column;">
                <div style="border-bottom: 2px solid #333; padding-bottom: 5px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between;">
                    <span>HELD ID: ${order.heldid}</span>
                </div>
                <div style="padding: 5px; flex-grow: 1; display: flex; flex-direction: column;">
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Cashier: ${order.cashier_name}</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: space-between; flex-grow: 1; max-height: 120px; overflow-y: auto;">
                        ${itemsGrid}
                    </div>
                    <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: auto;">
                        Total: ₹${order.price.toFixed(2)}
                    </div>
                </div>
                <div style="border-top: 2px solid #333; padding-top: 5px; text-align: right; display: flex; justify-content: space-between; align-items: center; gap: 5px;">
                    <button onclick="addHeldToBill(${order.heldid})" style="background-color: green; color: white; padding: 5px 10px; border: none; border-radius: 5px; width:140px; height:30px; flex-grow: 1;">Add</button>
                    <button onclick="deleteHeldOrder(${order.heldid})" style="background-color: red; color: white; padding: 5px 10px; border: none; border-radius: 5px; width:140px; height:30px; flex-grow: 1;">Delete</button>
                </div>
            </div>
        `;
    });

    popupContent += `</div></div>`;
    popup.innerHTML = popupContent;
    document.body.appendChild(popup);
});

function addHeldToBill(heldId) {
    ipcRenderer.send('get-held-order-details', heldId);
}

function deleteHeldOrder(heldId) {
    // Logic for deleting a held order
    ipcRenderer.send('delete-held-order', heldId);
}


ipcRenderer.on('held-order-details-data', (event, foodDetails, heldId) => {
    foodDetails.forEach(item => {
        addToBill(item.foodid, item.fname, item.price, item.quantity);
    });

    // Delete the held order from the database after restoring it to the bill
    ipcRenderer.send('delete-held-order', heldId);

    closeHeldPopup(); // Close the popup after adding items
});


function deleteHeldOrder(heldId) {
    if (confirm("Are you sure you want to delete this held order?")) {
        ipcRenderer.send('delete-held-order', heldId);
    }
}

// Handle held order deletion
ipcRenderer.on('held-order-deleted', (event, heldId) => {
    let row = document.querySelector(`tr[data-heldid="${heldId}"]`);
    if (row) {
        row.remove(); // Remove row from UI
    }
});

function closeHeldPopup() {
    let popup = document.getElementById("heldpopup");
    if (popup) {
        popup.remove();
    }
}


function createTextPopup(message) {
    // Remove existing popup if it exists
    let existingPopup = document.getElementById("custom-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup container
    const popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.classList.add("edit-popup");

    popup.innerHTML = `
        <div class="popup-content" style="align-items: center; justify-content: center; width: 300px; pointer-events: auto;">
            <p>${message}</p>

            <br>

            <div class="popup-buttons">
                <button id="closePopup" style="width: 90px; height: 40px;">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Add event listener for closing popup
    document.getElementById("closePopup").addEventListener("click", () => {
        popup.remove();
    });
}

// ------------ SAVE TO ORDER FUNCTIONALITY IS HERE ------------------
// Function to display today's orders in a popup
function displayTodaysOrders() {
    let existingPopup = document.getElementById("todaysOrdersPopup");

    if (existingPopup) {
        existingPopup.remove();
        return;
    }
    const billItems = document.querySelectorAll(".bill-item");
    let orderItems = [];

    billItems.forEach(item => {
        let foodId = item.id.replace("bill-item-", ""); // Extract item ID
        let quantity = parseInt(item.querySelector(".bill-quantity").textContent);

        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    if (orderItems.length === 0) {
        createTextPopup("No items in the bill. Please add items before proceeding.");
        return;
    }

    ipcRenderer.send("get-todays-orders-for-save-to-orders"); // Request today's orders from the main process
}

// Handle response from IPC and display orders in popup
ipcRenderer.on("todays-orders-response-for-save-to-orders", (event, data) => {
    if (!data.success) {
        createTextPopup("Error fetching today's orders.");
        return;
    }

    let popup = document.createElement("div");
    popup.id = "todaysOrdersPopup";
    popup.classList.add("edit-popup");

    let popupContent = `
        <div class="popup-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 850px;">
            <div style="width: 100%; display: flex; justify-content: flex-end;">
                <span class="close-btn" onclick="closeTodaysOrdersPopup()" style="cursor: pointer; font-size: 20px; font-weight: bold;">&times;</span>
            </div>
    `;

    if (data.orders.length === 0) {
        popupContent += `
            <div style="text-align: center; font-family: 'Arial', sans-serif; background-color: #f5f5f5; color: #333; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 50vh; width: 100%;">
                <div style="font-size: 36px; font-weight: bold; margin-bottom: 20px;">
                    No Orders For Today
                </div>
                <div style="font-size: 18px; margin-bottom: 30px;">
                    Come back after placing an order!
                </div>
                <button id='goHomeButton' style="font-size: 18px; color: #fff; background-color: #1DB954; padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer;">
                    Place an Order
                </button>
            </div>
        `;
    } else {
        popupContent += `
            <h3>Today's Orders</h3>
            <div class="custom-scrollbar" style="max-height: 550px; overflow-y: auto; width: 100%; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
        `;

        data.orders.forEach(order => {
            let itemsArray = order.food_items ? order.food_items.split(", ") : ["No items"];
            let itemsGrid = "";

            itemsArray.forEach(item => {
                itemsGrid += `<div style="padding: 3px; border: 1px solid #ddd; font-size: 12px; text-align: center; flex-grow: 1; flex-basis: 48%; height: 40px; display: flex; justify-content: center; align-items: center;">${item}</div>`;
            });

            popupContent += `
                <div style="border: 2px solid #333; width: 350px; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); height: 250px; display: flex; flex-direction: column;">
                    <div style="border-bottom: 2px solid #333; padding-bottom: 5px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between;">
                        <span>BILL NO: ${order.billno}</span>
                        <span>KOT: ${order.kot || "N/A"}</span>
                    </div>
                    <div style="padding: 5px; flex-grow: 1; display: flex; flex-direction: column;">
                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Cashier: ${order.cashier_name}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: space-between; flex-grow: 1; max-height: 120px; overflow-y: auto;">
                            ${itemsGrid}
                        </div>
                        <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: auto;">
                            Total: ₹${order.price.toFixed(2)}
                        </div>
                    </div>
                    <div style="border-top: 2px solid #333; padding-top: 5px; text-align: right;">
                        <button onclick="addToExistingOrder(${order.billno})" style="background-color: green; color: white; padding: 5px 10px; border: none; border-radius: 5px; width:100%; height:30px">
                            Add to Order
                        </button>
                    </div>
                </div>
            `;
        });

        popupContent += `</div>`;
    }

    popupContent += `</div>`;
    popup.innerHTML = popupContent;
    document.body.appendChild(popup);

    if (data.orders.length === 0) {
        document.getElementById('goHomeButton').addEventListener('click', function () {
            document.getElementById('Home').click();
        });
    }
});




// Function to add current bill items to an existing order
function addToExistingOrder(orderId) {
    // Get all bill items
    const billItems = document.querySelectorAll(".bill-item");
    let orderItems = [];

    billItems.forEach(item => {
        let foodId = item.id.replace("bill-item-", ""); // Extract item ID
        let quantity = parseInt(item.querySelector(".bill-quantity").textContent);

        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    if (orderItems.length === 0) {
        createTextPopup("No items in the bill. Please add items before proceeding.");
        return;
    }

    // Send order data to main process
    ipcRenderer.send("add-to-existing-order", { orderId, orderItems });

    // Close the popup after adding
    document.getElementById("todaysOrdersPopup").remove();
    resetBill();
    createTextPopup(`Order ${orderId} updated successfully with new items.`);
    NewOrder();
}

// Close popup function
function closeTodaysOrdersPopup() {
    let popup = document.getElementById("todaysOrdersPopup");
    if (popup) popup.remove();
}
// ------------ SAVE TO ORDER FUNCTIONALITY ENDS HERE ------------------
function NewOrder() {
    resetBill();
    updateMainContent('Home');
}