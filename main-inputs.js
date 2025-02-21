// input-sync.js

document.addEventListener('DOMContentLoaded', () => {
    const customerInput = document.getElementById('customer');
    const agentInput = document.getElementById('user');

    const syncEditableFields = (input, defaultText) => {
        return document.querySelectorAll(`.manual-edit[data-default-text="${defaultText}"]`);
    };

    // Synchronize input field with editable spans
    const updateEditableFromInput = (input, defaultText) => {
        const fields = syncEditableFields(input, defaultText);
        fields.forEach(field => field.textContent = input.value.trim() || defaultText);
    };

    const updateInputFromEditable = (input, defaultText) => {
        const fields = syncEditableFields(input, defaultText);
        fields.forEach(field => {
            field.addEventListener('input', () => {
                input.value = field.textContent.trim();
            });
            field.addEventListener('blur', () => {
                if (field.textContent.trim() === '' || field.textContent.trim() === defaultText) {
                    input.value = '';
                    field.textContent = defaultText;
                }
            });
        });
    };

    // Update editable fields when inputs change
    customerInput.addEventListener('input', () => updateEditableFromInput(customerInput, '[Cx Name]'));
    agentInput.addEventListener('input', () => updateEditableFromInput(agentInput, '[Agent Name]'));

    // Update inputs when editable spans change
    updateInputFromEditable(customerInput, '[Cx Name]');
    updateInputFromEditable(agentInput, '[Agent Name]');

    // Ensure reset updates both sides
    const observeResets = () => {
        const resetObserver = new MutationObserver(() => {
            document.querySelectorAll('.manual-edit').forEach(field => {
                const defaultText = field.getAttribute('data-default-text');
                if (field.textContent.trim() === defaultText) {
                    if (defaultText === '[Cx Name]') customerInput.value = '';
                    if (defaultText === '[Agent Name]') agentInput.value = '';
                }
            });
        });

        document.querySelectorAll('.manual-edit').forEach(field => {
            resetObserver.observe(field, { childList: true, subtree: true });
        });
    };

    observeResets();
});
