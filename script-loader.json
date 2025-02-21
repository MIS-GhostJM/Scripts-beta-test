async function loadScriptsFromJSON() {
    try {
        const response = await fetch('scripts.json');
        const scriptData = await response.json();
        const scriptCanvas = document.querySelector('.script-canvas');

        scriptData.forEach(script => {
            // Create the script module container
            const moduleDiv = document.createElement('div');
            moduleDiv.classList.add('script-module');
            moduleDiv.id = script.id;

            // Create the title section
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('script-title-chat', 'active');
            titleDiv.innerHTML = `<h4>${script.title}</h4><p>${script.subTitle}</p>`;
            moduleDiv.appendChild(titleDiv);

            // Add each card module
            script.cards.forEach(card => {
                const cardContainer = document.createElement('div');
                cardContainer.classList.add('script-card-sub');
                
                const cardModule = document.createElement('div');
                cardModule.classList.add('card-module');
                cardModule.innerHTML = `<p>${card.content}</p>`;

                cardContainer.appendChild(cardModule);
                moduleDiv.appendChild(cardContainer);
            });

            // Append the module to the script canvas
            scriptCanvas.appendChild(moduleDiv);
        });

        console.log('Script modules loaded successfully.');
    } catch (error) {
        console.error('Failed to load script modules:', error);
    }
}

// Load the scripts after DOM is ready
document.addEventListener('DOMContentLoaded', loadScriptsFromJSON);
