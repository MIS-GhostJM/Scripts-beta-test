document.addEventListener('DOMContentLoaded', () => {
    const scriptCanvas = document.querySelector('.script-canvas');
    const scriptNavContainer = document.querySelector('.script-nav-container');
    const jsonFilePath = 'https://mis-ghostjm.github.io/Scripts-beta-test/scripts.json';
    const customerInput = document.getElementById('customer');
    const agentInput = document.getElementById('user');
    let stateManager;

    fetch(jsonFilePath)
        .then(response => response.json())
        .then(data => {
            generateNavButtons(data);
            generateMergedScriptModules(data);
            initializeAllFunctionality();
            initializeNavigation();
        })
        .catch(error => console.error('Failed to load scripts:', error));

    function generateNavButtons(scripts) {
        // Clear existing nav buttons
        scriptNavContainer.innerHTML = '';
        
        // Get unique IDs and their first occurrence data
        const uniqueScripts = scripts.reduce((unique, script) => {
            if (!unique.has(script.id)) {
                unique.set(script.id, script);
            }
            return unique;
        }, new Map());

        // Create nav buttons for unique IDs
        uniqueScripts.forEach((script, id) => {
            const button = document.createElement('button');
            button.id = `${id}-nav`;
            button.className = 'nav-btn';
            if (id === 'Opening') {
                button.classList.add('active');
            }
            
            // Convert ID to title case for button text
            const buttonText = id
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            button.textContent = buttonText;
            scriptNavContainer.appendChild(button);
        });
    }

    function initializeAllFunctionality() {
        if (typeof initializeEnhancedCardModules === 'function') {
            initializeEnhancedCardModules();
            stateManager = new EditStateManager();
        }
        initializeSyncInputs();
    }

    function initializeNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                navButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const moduleId = button.id.replace('-nav', '');
                updateActiveModule(moduleId);
            });
        });
    }

    function updateActiveModule(moduleId) {
        const scriptModules = document.querySelectorAll('.script-module');
        scriptModules.forEach(module => {
            module.classList.toggle('active', module.id === moduleId);
            
            const titles = module.querySelectorAll('.script-title-chat, .script-title-voice');
            const cardSubs = module.querySelectorAll('.script-card-sub');
            
            titles.forEach(title => {
                title.classList.toggle('active', module.id === moduleId);
            });
            
            cardSubs.forEach(cardSub => {
                cardSub.classList.toggle('active', module.id === moduleId);
            });
        });
    }

    function generateMergedScriptModules(scripts) {
        const scriptGroups = scripts.reduce((groups, script) => {
            if (!groups[script.id]) groups[script.id] = [];
            groups[script.id].push(script);
            return groups;
        }, {});

        Object.entries(scriptGroups).forEach(([scriptId, scriptsGroup]) => {
            const isActive = scriptId === 'Opening';
            const moduleDiv = document.createElement('div');
            moduleDiv.classList.add('script-module');
            if (isActive) moduleDiv.classList.add('active');
            moduleDiv.id = scriptId;

            scriptsGroup.forEach(script => {
                const titleDiv = document.createElement('div');
                titleDiv.classList.add(`script-title-${script.category}`);
                if (isActive) titleDiv.classList.add('active');
                titleDiv.innerHTML = `<h4>${script.title}</h4>`;

                // Conditionally add description if not empty
                if (script.description.trim() !== '') {
                    const descPara = document.createElement('p');
                    descPara.textContent = script.description;
                    titleDiv.appendChild(descPara);
                }

                moduleDiv.appendChild(titleDiv);

                let cardSubDiv = titleDiv.nextElementSibling;
                if (!cardSubDiv || !cardSubDiv.classList.contains('script-card-sub')) {
                    cardSubDiv = document.createElement('div');
                    cardSubDiv.classList.add('script-card-sub');
                    if (isActive) cardSubDiv.classList.add('active');
                    moduleDiv.appendChild(cardSubDiv);
                }

                script.cards.forEach(card => {
                    const cardDiv = document.createElement('div');
                    cardDiv.classList.add('card-module');
                    cardDiv.innerHTML = convertToEditable(card.content);
                    if (typeof CardModule !== 'undefined' && stateManager) {
                        new CardModule(cardDiv, stateManager);
                    }
                    cardSubDiv.appendChild(cardDiv);
                });
            });

            scriptCanvas.appendChild(moduleDiv);
        });
    }
    

    function convertToEditable(content) {
        return content.replace(/\[(.+?)\]/g, (match, p1) => {
            return `<span class="manual-edit" data-default-text="${match}">${match}</span>`;
        });
    }

    function initializeSyncInputs() {
        updateEditableFromInput(customerInput, '[Cx Name]');
        updateEditableFromInput(agentInput, '[Agent Name]');

        customerInput.addEventListener('input', () => syncFromInput(customerInput, '[Cx Name]'));
        agentInput.addEventListener('input', () => syncFromInput(agentInput, '[Agent Name]'));

        observeResets();
    }

    function syncFromInput(input, defaultText) {
        const value = input.value.trim();
        const fields = document.querySelectorAll(`.manual-edit[data-default-text="${defaultText}"]`);
        
        fields.forEach(field => {
            if (!field.classList.contains('editing')) {
                field.textContent = value || defaultText;
                if (stateManager) {
                    stateManager.updateGroup(defaultText, field.textContent, null);
                }
            }
        });
    }

    function updateEditableFromInput(input, defaultText) {
        const value = input.value.trim();
        const fields = document.querySelectorAll(`.manual-edit[data-default-text="${defaultText}"]`);
        
        fields.forEach(field => {
            if (!field.classList.contains('editing')) {
                field.textContent = value || defaultText;
                if (stateManager) {
                    stateManager.updateGroup(defaultText, field.textContent, null);
                }

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'characterData' || mutation.type === 'childList') {
                            const newValue = field.textContent.trim();
                            if (newValue !== defaultText) {
                                input.value = newValue;
                            } else {
                                input.value = '';
                            }
                        }
                    });
                });

                observer.observe(field, {
                    characterData: true,
                    childList: true,
                    subtree: true
                });
            }
        });
    }

    function observeResets() {
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
    }
});
