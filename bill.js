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
        createTextPopup("Please select a quantity greater than 0 to add to the bill.")
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
        createTextPopup("Discount cannot be negative.");
        return;
    }

    if (discountPercentage > 0 && discountAmount > 0) {
        createTextPopup("Please apply either a percentage discount OR a fixed amount discount, not both.");
        return;
    }

    if (discountAmount > totalAmount) {
        createTextPopup("Discount amount cannot exceed the total bill amount.");
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

// Function to only save the bill
function saveBill() {
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

    // Generate ESC/POS commands for printing
    const escPosCommands = generateEscPosCommands(billItems, discountedTotal);

    // Send ESC/POS commands to the printer
    ipcRenderer.send("print-bill", escPosCommands);

    // Add the glow effect to the bill panel
    const billPanel = document.getElementById("bill-panel");
    billPanel.classList.add("glow");

    // Remove the glow effect after 2 seconds
    setTimeout(() => {
        billPanel.classList.remove("glow");
    },800);

    NewOrder();
}

// Function to generate ESC/POS commands for the bill
function generateEscPosCommands(billItems, totalAmount) {
    let commands = [];

    // Initialize printer
    commands.push("\x1B\x40"); // Initialize printer

    // Print header (Lassi Corner)
    commands.push("\x1B\x61\x01"); // Center align
    commands.push("\x1D\x21\x11"); // Double height and width
    commands.push("Lassi Corner\n");
    commands.push("\x1D\x21\x00"); // Reset text size
    commands.push("\x1B\x61\x00"); // Left align

    // Print bill items
    commands.push("\x1B\x45\x01"); // Bold on
    commands.push("Item\tQty\tPrice\n");
    commands.push("\x1B\x45\x00"); // Bold off

    billItems.forEach(item => {
        const itemName = item.querySelector(".bill-item-name").textContent;
        const quantity = item.querySelector(".bill-quantity").value;
        const totalPrice = item.querySelector(".bill-total").textContent;

        commands.push(`${itemName}\t${quantity}\t${totalPrice}\n`);
    });

    // Print total
    commands.push("\x1B\x45\x01"); // Bold on
    commands.push(`Total: Rs. ${totalAmount.toFixed(2)}\n`);
    commands.push("\x1B\x45\x00"); // Bold off

    // Print footer (Thank you for visiting)
    commands.push("\x1B\x61\x01"); // Center align
    commands.push("Thank you for visiting!\n");
    commands.push("\x1B\x61\x00"); // Left align

    // Cut paper
    commands.push("\x1D\x56\x41\x10"); // Partial cut

    return commands.join("");
}

// Edit-Mode Bill Panel Starts Here------------------------------------------------------------------------------
function displayEditMode() {
    // Hide all existing buttons
    document.getElementById("upperbuttons").style.display = "none";
    document.getElementById("bill-buttons").style.display = "none";

    // Check if edit mode buttons already exist, if not, create them
    let editButtonsContainer = document.getElementById("edit-buttons");
    if (!editButtonsContainer) {
        editButtonsContainer = document.createElement("div");
        editButtonsContainer.id = "edit-buttons";
        editButtonsContainer.style.display = "flex";
        editButtonsContainer.style.justifyContent = "center";
        editButtonsContainer.style.gap = "20px"; // Increased gap between buttons
        editButtonsContainer.style.marginTop = "20px"; // Increased margin
        editButtonsContainer.style.width = "100%"; // Full width for better alignment

        // Save Button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.id = "save-edit";
        saveButton.onclick = saveEdit;
        styleButton(saveButton); // Apply button styling

        // Cancel Button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.id = "cancel-edit";
        cancelButton.onclick = exitEditMode;
        styleButton(cancelButton); // Apply button styling

        // Append buttons
        editButtonsContainer.appendChild(saveButton);
        editButtonsContainer.appendChild(cancelButton);
        document.getElementById("bill-panel").appendChild(editButtonsContainer);
    }

    // Show the edit mode buttons
    editButtonsContainer.style.display = "flex";
}

function saveEdit() {
    const billItems = document.querySelectorAll(".bill-item");
    let orderItems = [];

    // Collect the updated items from the bill panel
    billItems.forEach(item => {
        let foodId = item.id.replace("bill-item-", ""); // Extract item ID
        let quantity = parseInt(item.querySelector(".bill-quantity").value);
        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    // Get the bill number of the order being edited
    const billno = sessionStorage.getItem("editingBillNo");

    if (!billno) {
        createTextPopup("No order is being edited")
        return;
    }

    // Send the updated order details to the main process
    ipcRenderer.send("update-order", { billno, orderItems });
}

// Listen for update response
ipcRenderer.on("update-order-response", (event, response) => {
    if (response.success) {
        createTextPopup("Order updated successfully!");
        exitEditMode();
        ipcRenderer.send("get-todays-orders"); // Refresh today's orders
    } else {
        createTextPopup("Failed to update order. Please try again.")
    }
});

function exitEditMode() {
    // Show original buttons
    document.getElementById("upperbuttons").style.display = "flex";
    document.getElementById("bill-buttons").style.display = "flex";

    // Hide edit mode buttons
    const editButtonsContainer = document.getElementById("edit-buttons");
    if (editButtonsContainer) {
        editButtonsContainer.style.display = "none";
    }

    // Clear the bill panel
    resetBill();
}

// Function to apply button styles similar to existing ones
function styleButton(button) {
    button.style.fontSize = "16px";
    button.style.padding = "10px 20px";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.gap = "10px";
    button.style.backgroundColor = "#0C345A";
    button.style.width = "150px";
    button.style.transition = "background-color 0.3s ease";

    // Add hover effect
    button.addEventListener("mouseenter", () => {
        button.style.backgroundColor = "#0A2A4A"; // Darker shade on hover
    });

    button.addEventListener("mouseleave", () => {
        button.style.backgroundColor = "#0C345A"; // Restore original color
    });
}
// Edit-mode Bill panel ends here-------------------------------------------------------------------------------------------

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
        let quantity = parseInt(item.querySelector(".bill-quantity").value);

        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    if (orderItems.length === 0) {
        createTextPopup("No items in the bill. Please add items before proceeding.");
        return;
    }

    // Send order data to main process
    ipcRenderer.send("hold-bill", { cashier, date, orderItems });

    // Show confirmation popup
    createTextPopup("Bill put on hold!");

    NewOrder();
}
// Function to toggle the visibility of the discount inputs and apply button
function toggleDiscountPopup() {
    const billItems = document.querySelectorAll(".bill-item");
    let orderItems = [];

    billItems.forEach(item => {
        let foodId = item.id.replace("bill-item-", ""); // Extract item ID
        let quantity = parseInt(item.querySelector(".bill-quantity").value);

        orderItems.push({ foodId: parseInt(foodId), quantity });
    });

    if (orderItems.length === 0) {
        createTextPopup("No items in the bill. Please add items before proceeding.");
        return;
    }

    let existingPopup = document.getElementById("discount-popup");
    if (existingPopup) {
        existingPopup.remove();
        return;
    }

    const popup = document.createElement("div");
    popup.id = "discount-popup";
    popup.classList.add("edit-popup");

    popup.innerHTML = `
        <div class="popup-content" style="display: flex; flex-direction: column; max-width: 100%; width: 300px; pointer-events: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h3 style="font-size: 1.5em; margin-bottom: 16px; color: #333; text-align: center;">Apply Discount</h3>
            
            <label for="discount-percentage" style="margin-bottom: 8px; font-weight: bold; color: #555;">Discount Percentage:</label>
            <input type="number" id="discount-percentage" placeholder="Enter discount %" min="0" max="100" step="0.01" style="width: 100%; padding: 8px; margin-bottom: 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" required>
        
            <label for="discount-amount" style="margin-bottom: 8px; font-weight: bold; color: #555;">Fixed Discount (Rs.):</label>
            <input type="number" id="discount-amount" placeholder="Enter discount amount" min="0" step="0.01" style="width: 100%; padding: 8px; margin-bottom: 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;" required>
        
            <div class="popup-buttons" style="display: flex; justify-content: center; gap: 10px;">
                <button id="apply-discount-btn" type="button" style="width: 90px; height: 40px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Apply</button>
                <button id="closePopup" type="button" style="width: 90px; height: 40px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
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
            <div data-heldid="${order.heldid}" style="border: 2px solid #333; width: 350px; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); height: 250px; display: flex; flex-direction: column;">
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
    let orderCard = document.querySelector(`#heldpopup div[data-heldid="${heldId}"]`);
    if (orderCard) {
        orderCard.remove(); // Remove the order card from the UI
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
        let quantity = parseInt(item.querySelector(".bill-quantity").value);

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
                itemsGrid += `<div style="padding: 3px; border: 1px solid #ddd; font-size: 12px; text-align: center; flex-grow: 1; flex-basis: 48%; height: 40px; display: flex; justify-content: center; align-items: center; background: #f1f1f1;">${item}</div>`;
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
                        <button onclick="addToExistingOrder(${order.billno})" style="background-color: #1db954; color: white; padding: 5px 10px; border: none; border-radius: 5px; width:100%; height:30px">
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
        let quantity = parseInt(item.querySelector(".bill-quantity").value);

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
