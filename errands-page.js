document.addEventListener('DOMContentLoaded', function () {
    // Initialize local storage and set up listeners
    if (!localStorage.getItem('archivedErrands')) {
        localStorage.setItem('archivedErrands', JSON.stringify([]));
    }
    updateArchiveDisplay();
    setupFormListeners();

    // Collapse/Expand form area on heading click
    document.querySelectorAll('.customer-heading').forEach(heading => {
        heading.addEventListener('click', () => {
            const formArea = heading.nextElementSibling;
            const notesTextarea = heading.closest('.form-container').querySelector('textarea');
            if (formArea) {
                formArea.classList.toggle('collapsed');
                adjustTextareaHeight();
            }
        });
    });

    // Add CSS for collapsed state
    const style = document.createElement('style');
    style.innerHTML = `.collapsed { display: none; }`;
    document.head.appendChild(style);

    // Adjust textarea height based on form collapse state
    function adjustTextareaHeight() {
        document.querySelectorAll('textarea').forEach(textarea => {
            const formArea = textarea.closest('.form-container').querySelector('.form-area');
            if (formArea && formArea.classList.contains('collapsed')) {
                textarea.style.height = '400px'; // Expand when form is collapsed
            } else {
                textarea.style.height = '100px'; // Default height
            }
        });
    }

    // Update heading text when customer name input changes
    document.querySelectorAll("[id^='input-cxname-']").forEach(input => {
        input.addEventListener("input", () => {
            const formContainer = input.closest(".form-container");
            const heading = formContainer.querySelector("h2");
            heading.textContent = input.value.trim() || heading.dataset.originalText || heading.textContent;
        });
    });

    // Set up listeners for copy, clear, and archive buttons
    function setupFormListeners() {
        document.querySelectorAll('.form-container').forEach((form, index) => {
            const formIndex = index + 1;

            // Clear button
            form.querySelector('.clear-button').addEventListener('click', () => {
                clearForm(formIndex);
            });

            // Copy button
            form.querySelector('.copy-button').addEventListener('click', () => {
                copyFormData(formIndex);
            });

            // Archive button
            form.querySelector('.archive-button').addEventListener('click', () => {
                archiveFormData(formIndex);
            });
        });
    }

    // Clear form fields
    function clearForm(formIndex) {
        const form = document.querySelector(`.form-container:nth-child(${formIndex})`);
        form.querySelectorAll('input, textarea').forEach(input => input.value = '');
        const clearButton = form.querySelector('.clear-button');
        clearButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 6h18v2H3V6zm2.414 2l.586 14h11l.586-14H5.414zM9 4h6v2H9V4z"/>
        </svg>`;
        setTimeout(() => clearButton.textContent = 'Clear', 2000);
    }

    // Copy form data with feedback
    function copyFormData(formIndex) {
        const form = document.querySelector(`.form-container:nth-child(${formIndex})`);
        let copiedData = '';

        form.querySelectorAll("input[type='text']").forEach(input => {
            if (input.value.trim()) {
                const label = form.querySelector(`label[for='${input.id}']`).textContent.trim();
                copiedData += `${label}: ${input.value}\n`;
            }
        });

        if (copiedData) {
            navigator.clipboard.writeText(copiedData).then(() => {
                const copyButton = form.querySelector('.copy-button');
                copyButton.textContent = 'Copied!';
                setTimeout(() => copyButton.textContent = 'Copy', 1000);
            }).catch(() => {
                alert('Failed to copy!');
            });
        } else {
            alert('Nothing to copy!');
        }
    }

    // Archive form data
    function archiveFormData(formIndex) {
        const form = document.querySelector(`.form-container:nth-child(${formIndex})`);
        const formData = {
            interactionId: document.getElementById(`input-interaction-id-${formIndex}`).value,
            customerName: document.getElementById(`input-cxname-${formIndex}`).value,
            dpa: document.getElementById(`input-dpa-${formIndex}`).value,
            relationship: document.getElementById(`input-relationship-${formIndex}`).value,
            query: document.getElementById(`input-query-${formIndex}`).value,
            resolution: document.getElementById(`input-resolution-${formIndex}`).value,
            yyrl: document.getElementById(`input-yyrl-${formIndex}`).value,
            ghostline: document.getElementById(`input-ghostline-${formIndex}`).value,
            validator: document.getElementById(`input-validator-${formIndex}`).value,
            notes: document.getElementById(`notes-${formIndex}`).value,
            archivedDate: new Date().toLocaleString()
        };

        if (!formData.interactionId || !formData.customerName) {
            alert('Please fill in Interaction ID and Customer Name.');
            return;
        }

        const archivedErrands = JSON.parse(localStorage.getItem('archivedErrands')) || [];
        archivedErrands.push(formData);
        localStorage.setItem('archivedErrands', JSON.stringify(archivedErrands));
        updateArchiveDisplay();
        clearForm(formIndex);
        alert('Form data archived!');
    }

    // Restore archived item
    function restoreArchivedItem(index) {
        const archivedErrands = JSON.parse(localStorage.getItem('archivedErrands')) || [];
        if (index >= 0 && index < archivedErrands.length) {
            const errand = archivedErrands[index];
            let targetFormIndex = document.getElementById('input-interaction-id-1').value ? 2 : 1;
            const form = document.querySelector(`.form-container:nth-child(${targetFormIndex})`);

            Object.keys(errand).forEach(key => {
                const input = form.querySelector(`[id^='input-${key}-${targetFormIndex}']`);
                if (input) input.value = errand[key];
            });

            document.getElementById(`input-interaction-id-${targetFormIndex}`).value = errand.interactionId;
            document.getElementById(`input-cxname-${targetFormIndex}`).value = errand.customerName;
            document.getElementById(`notes-${targetFormIndex}`).value = errand.notes || '';

            if (confirm(`Restored to Form ${targetFormIndex}. Remove from archive?`)) {
                deleteArchivedItem(index);
            }
        }
    }

    // Delete archived item
    function deleteArchivedItem(index) {
        const archivedErrands = JSON.parse(localStorage.getItem('archivedErrands')) || [];
        if (index >= 0 && index < archivedErrands.length) {
            archivedErrands.splice(index, 1);
            localStorage.setItem('archivedErrands', JSON.stringify(archivedErrands));
            updateArchiveDisplay();
        }
    }

    // Before unload warning
    window.addEventListener('beforeunload', function (event) {
        const message = 'Are you sure you want to leave? Your changes may not be saved.';
        event.returnValue = message;
        return message;
    });

    // Update archive display
    function updateArchiveDisplay() {
        const archivedErrands = JSON.parse(localStorage.getItem('archivedErrands')) || [];
        const tableBody = document.getElementById('archived-errands-body');
        const noArchivesMessage = document.getElementById('no-archives-message');
        tableBody.innerHTML = '';

        if (archivedErrands.length === 0) {
            noArchivesMessage.style.display = 'block';
        } else {
            noArchivesMessage.style.display = 'none';
            archivedErrands.forEach((errand, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${errand.interactionId}</td>
                    <td>${errand.customerName}</td>
                    <td>${errand.dpa || 'N/A'}</td>
                    <td>${errand.relationship || 'N/A'}</td>
                    <td>${errand.query || 'N/A'}</td>
                    <td>${errand.resolution || 'N/A'}</td>
                    <td>${errand.yyrl || 'N/A'}</td>
                    <td>${errand.ghostline || 'N/A'}</td>
                    <td>${errand.validator || 'N/A'}</td>
                    <td>${errand.notes || 'N/A'}</td>
                    <td>${errand.archivedDate}</td>
                    <td>
                        <button class="restore-btn" data-index="${index}">Restore</button>
                        <button class="delete-btn" data-index="${index}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            document.querySelectorAll('.restore-btn').forEach(button => {
                button.addEventListener('click', () => restoreArchivedItem(parseInt(button.dataset.index)));
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => deleteArchivedItem(parseInt(button.dataset.index)));
            });
        }
    }
});
