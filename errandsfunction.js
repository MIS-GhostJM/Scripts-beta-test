document.addEventListener("DOMContentLoaded", () => {
    // Select elements once
    const headings = document.querySelectorAll(".customer-heading");
    const copyButtons = document.querySelectorAll(".Copy-button");
    const customerNameInputs = document.querySelectorAll("[id^='input-cxname-']");
    const customerHeadings = document.querySelectorAll("[id^='customer']");
    const clearButtons = document.querySelectorAll(".Clear-button");
    const toggleButtons = document.querySelectorAll(".form-container h2");

    // Collapse/Expand form area on heading click
    headings.forEach(heading => {
        heading.addEventListener("click", () => {
            const formArea = heading.nextElementSibling;
            if (formArea) formArea.classList.toggle("collapsed");
        });
    });

    // Add CSS for collapsed state
    const style = document.createElement("style");
    style.innerHTML = `.collapsed { display: none; }`;
    document.head.appendChild(style);

    // Update heading text when customer name input changes
    customerNameInputs.forEach(input => {
        input.addEventListener("input", () => {
            const formContainer = input.closest(".form-container");
            const heading = formContainer.querySelector("h2");
            heading.textContent = input.value.trim() || heading.dataset.originalText || heading.textContent;
        });
    });

    // Handle copy button functionality
    copyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const form = button.closest(".form-container");
            let copiedData = "";
            form.querySelectorAll("input[type='text']").forEach(input => {
                if (input.value.trim()) {
                    const label = form.querySelector(`label[for="${input.id}"]`).textContent.trim();
                    copiedData += `${label}: ${input.value.trim()}\n`;
                }
            });

            if (copiedData) {
                navigator.clipboard.writeText(copiedData).then(() => {
                    button.textContent = "Copied!";
                    setTimeout(() => button.textContent = "Copy", 1000);
                }).catch(() => {
                    button.textContent = "Copy Failed!";
                    setTimeout(() => button.textContent = "Copy", 1000);
                });
            } else {
                button.textContent = "Nothing to Copy!";
                setTimeout(() => button.textContent = "Copy", 1000);
            }
        });
    });

    // Toggle form area visibility and update heading text
    toggleButtons.forEach(heading => {
        heading.addEventListener("click", () => {
            const formArea = heading.closest(".form-container").querySelector(".form-area");
            const input = formArea.querySelector("[id^='input-cxname-']");
            const originalHeadingText = heading.dataset.originalText || heading.textContent;
            if (!heading.dataset.originalText) heading.dataset.originalText = originalHeadingText;

            formArea.style.display = formArea.style.display === "none" ? "block" : "none";
            heading.textContent = input.value.trim() || heading.dataset.originalText;
        });
    });

    // Clear input fields and update button text
    clearButtons.forEach(button => {
        button.addEventListener("click", () => {
            const form = button.closest("form");
            form.querySelectorAll("input[type='text']").forEach(input => input.value = "");
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 6h18v2H3V6zm2.414 2l.586 14h11l.586-14H5.414zM9 4h6v2H9V4z"/>
            </svg>`;
            setTimeout(() => button.textContent = "Clear", 2000);
        });
    });

    // Handle before unload confirmation
    window.addEventListener('beforeunload', function (event) {
        const message = "Are you sure you want to leave? Your changes may not be saved.";
        event.returnValue = message;
        return message;
    });
});
