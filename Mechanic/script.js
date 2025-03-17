let vehicleMultiplier = 1.0;
let selectedVehicleText = "Unknown";

document.querySelectorAll('input[name="vehicle"]').forEach(vehicle => {
    vehicle.addEventListener('change', function() {
        vehicleMultiplier = parseFloat(this.value);
        selectedVehicleText = this.nextSibling.textContent.trim();
        updateBill();
    });
});

document.querySelectorAll('.repair').forEach(repair => {
    repair.addEventListener('change', updateBill);
});

document.querySelectorAll('.quantity').forEach(quantity => {
    quantity.addEventListener('change', updateBill);
});

document.querySelectorAll('input[name="tow"]').forEach(tow => {
    tow.addEventListener('change', updateBill);
});

document.querySelectorAll('input[name="discount"]').forEach(discount => {
    discount.addEventListener('change', updateBill);
});

// Handle "Enter" key press to apply custom discount
document.getElementById('customDiscount').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        updateBill();  // Update the bill when "Enter" is pressed
    }
});

// Handle clicking outside (losing focus) to apply custom discount
document.getElementById('customDiscount').addEventListener('blur', function() {
    updateBill();  // Update the bill when the input loses focus
});

function updateBill() {
    const billList = document.querySelector('.bill-list');
    const totalSpan = document.getElementById('total');
    billList.innerHTML = '';

    let total = 0;
    let vehicleTypeHeader = document.createElement('li');
    vehicleTypeHeader.innerHTML = `<strong>Repairing Bill of ${selectedVehicleText}:</strong>`;
    billList.appendChild(vehicleTypeHeader);

    // Add engine repair section
    const engineRepairs = document.querySelectorAll('.repair[data-repair="engine"]:checked');
    engineRepairs.forEach(repair => {
        let itemText = repair.nextSibling.textContent.trim();
        let itemValue = parseFloat(repair.value) * vehicleMultiplier;
        total += itemValue;
        let li = document.createElement('li');
        li.textContent = `Engine ${itemText}: $${itemValue.toFixed(2)}`;
        billList.appendChild(li);
    });

    // Add body repair section
    const bodyRepairs = document.querySelectorAll('.repair[data-repair="body"]:checked');
    bodyRepairs.forEach(repair => {
        let itemText = repair.nextSibling.textContent.trim();
        let itemValue = parseFloat(repair.value) * vehicleMultiplier;
        total += itemValue;
        let li = document.createElement('li');
        li.textContent = `Body ${itemText}: $${itemValue.toFixed(2)}`;
        billList.appendChild(li);
    });

    // Create an object to store the additions and their total quantities
    let additions = {};

    // Add additional repairs (motor oil change, advance repair kit, etc.)
    document.querySelectorAll('.repair:not([data-repair="engine"]):not([data-repair="body"])').forEach(repair => {
        if (repair.checked) {
            let itemText = repair.nextSibling.textContent.trim().split(" ")[0]; // Get the first word
            let itemValue = parseFloat(repair.value) * vehicleMultiplier;

            // Update the item text to full name for specific items
            if (itemText === "Motor") {
                itemText = "Motor Oil";
            } else if (itemText === "Advance") {
                itemText = "Advance Repair Kit";
            }

            let repairType = repair.getAttribute('data-repair');
            let quantity = 1; // Default quantity
            if (document.querySelector(`.quantity[data-repair="${repairType}"]`)) {
                quantity = parseInt(document.querySelector(`.quantity[data-repair="${repairType}"]`).value);
                itemValue *= quantity;
            }

            // Store the total price for the specific repair item and its quantity
            if (!additions[itemText]) {
                additions[itemText] = { totalValue: 0, quantity: 0 };
            }
            additions[itemText].totalValue += itemValue;
            additions[itemText].quantity += quantity;
        }
    });

    // Now, add each addition with the correct quantity and total value
    for (const item in additions) {
        let { totalValue, quantity } = additions[item];
        let li = document.createElement('li');
        li.textContent = `${item} (${quantity}x): $${totalValue.toFixed(2)}`;
        billList.appendChild(li);
        total += totalValue;
    }

    // Add tow service section
    document.querySelectorAll('input[name="tow"]:checked').forEach(tow => {
        const towDistance = parseFloat(tow.value);
        total += towDistance;
        let li = document.createElement('li');
        li.textContent = `Tow Service (${towDistance}m): $${towDistance.toFixed(2)}`;
        billList.appendChild(li);
    });

    // Add discount section
    let discountRate = parseFloat(document.querySelector('input[name="discount"]:checked')?.value || 0);
    
    // Check if custom discount is provided
    const customDiscount = document.getElementById('customDiscount').value;
    if (customDiscount) {
        discountRate = parseFloat(customDiscount) / 100;  // Convert to decimal
    }
    
    let discountAmount = total * discountRate;
    let discountedTotal = total - discountAmount;

    if (discountRate > 0) {
        let discountLi = document.createElement('li');
        discountLi.innerHTML = `<strong>Discount (${(discountRate * 100).toFixed(0)}%): -$${discountAmount.toFixed(2)}</strong>`;
        billList.appendChild(discountLi);
    }

    // Update total
    totalSpan.textContent = discountedTotal.toFixed(2);
}

function copyBill() {
    let billText = `Repairing Bill of ${selectedVehicleText}:\n`;
    document.querySelectorAll('.bill-list li').forEach((li, index) => {
        if (index !== 0) billText += li.textContent + '\n';
    });
    billText += `Total: $${document.getElementById('total').textContent}`;

    navigator.clipboard.writeText(billText).then(() => {
        let popup = document.getElementById("popupMessage");
        popup.style.display = "block";
        setTimeout(() => { popup.style.display = "none"; }, 2000);
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
}