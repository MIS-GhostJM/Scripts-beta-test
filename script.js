// Cache DOM elements
const DOM = {
    channelSelect: document.getElementById('channel-selection'),
    scriptNavContainer: document.querySelector('.script-nav-container'),
    navButtons: document.querySelectorAll('.nav-btn'),
    scriptModules: document.querySelectorAll('.script-module'),
    navItems: document.querySelectorAll('.nav-item'),
    subPages: document.querySelectorAll('.sub-page'),
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-action'),
    scriptTitles: {
        chat: document.querySelectorAll('.script-title-chat'),
        voice: document.querySelectorAll('.script-title-voice')
    }
};

// State management
const state = {
    currentChannel: 'all',
    activeNavButton: null
};

const SearchManager = {
    isSearchActive: false, // Track if search is currently active

    // Reset all modules to inactive state
    resetModules() {
        document.querySelectorAll('.script-module').forEach(module => {
            module.classList.remove('active');
            module.querySelectorAll('.script-title-chat, .script-title-voice').forEach(title => {
                title.classList.remove('active');
            });
            module.querySelectorAll('.script-card-sub').forEach(card => {
                card.classList.remove('active');
            });
        });
    },

    // Restore default state
    restoreDefaultState() {
        this.isSearchActive = false;
        this.resetModules();
        DOM.searchInput.value = ''; // Clear search input
        ScriptManager.updateModule(); // Restore default module state
        
        // Restore channel-based visibility
        const currentChannel = DOM.channelSelect.value;
        ScriptManager.updateTitles(currentChannel);
    },

    // Activate matching modules and their components
    activateModule(title) {
        const scriptModule = title.closest('.script-module');
        if (scriptModule) {
            scriptModule.classList.add('active');
            
            // Get corresponding card-sub for this title
            const cardSub = title.nextElementSibling;
            if (cardSub && cardSub.classList.contains('script-card-sub')) {
                cardSub.classList.add('active');
            }
            
            title.classList.add('active');
        }
    },

    // Extract only the heading text from title element
    getTitleText(titleElement) {
        const heading = titleElement.querySelector('h4');
        return heading ? heading.textContent.trim() : '';
    },

    // Search implementation
    performSearch(searchTerm) {
        searchTerm = searchTerm.trim();
        if (!searchTerm) {
            this.restoreDefaultState();
            return;
        }

        this.isSearchActive = true;
        this.resetModules();
        const searchLower = searchTerm.toLowerCase();
        let hasResults = false;

        // Search in chat titles
        DOM.scriptTitles.chat.forEach(title => {
            const titleText = this.getTitleText(title).toLowerCase();
            if (titleText.includes(searchLower)) {
                this.activateModule(title);
                hasResults = true;
            }
        });

        // Search in voice titles
        DOM.scriptTitles.voice.forEach(title => {
            const titleText = this.getTitleText(title).toLowerCase();
            if (titleText.includes(searchLower)) {
                this.activateModule(title);
                hasResults = true;
            }
        });

        if (!hasResults) {
            console.log('No matching scripts found');
        }
    },

    // Initialize search events
    init() {
        // Search button click handler
        DOM.searchButton.addEventListener('click', () => {
            this.performSearch(DOM.searchInput.value);
        });

        // Search input enter key handler
        DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(DOM.searchInput.value);
            }
        });

        // Optional: Real-time search as user types (with debounce)
        let debounceTimer;
        DOM.searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.performSearch(DOM.searchInput.value);
            }, 300);
        });

        // Add state restoration to navigation events
        DOM.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.isSearchActive) {
                    this.restoreDefaultState();
                }
            });
        });

        // Add state restoration to channel selection
        DOM.channelSelect.addEventListener('change', () => {
            if (this.isSearchActive) {
                this.restoreDefaultState();
            }
        });

        // Add state restoration to side navigation
        DOM.navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (this.isSearchActive) {
                    this.restoreDefaultState();
                }
            });
        });
    }
};

// Script title management
const ScriptManager = {
    updateTitles(channel) {
        const elements = {
            chat: document.querySelectorAll('.script-title-chat'),
            voice: document.querySelectorAll('.script-title-voice')
        };

        // Helper function to toggle elements
        const toggleElements = (elements, isActive) => {
            elements.forEach(title => {
                title.classList.toggle('active', isActive);
                const cardSub = title.nextElementSibling;
                if (cardSub?.classList.contains('script-card-sub')) {
                    cardSub.classList.toggle('active', isActive);
                }
            });
        };

        // Reset all elements first
        toggleElements(elements.chat, false);
        toggleElements(elements.voice, false);

        // Activate based on channel selection
        if (channel === 'all' || channel === 'chat') {
            toggleElements(elements.chat, true);
        }
        if (channel === 'all' || channel === 'voice') {
            toggleElements(elements.voice, true);
        }

        state.currentChannel = channel;
    },

    updateModule() {
        DOM.scriptModules.forEach(module => module.classList.remove('active'));
        
        const activeButton = DOM.scriptNavContainer.querySelector('.nav-btn.active');
        if (activeButton) {
            const moduleId = activeButton.id.replace('-nav', '');
            const targetModule = document.getElementById(moduleId);
            if (targetModule) targetModule.classList.add('active');
        }
    }
};

// Navigation management
const NavigationManager = {
    setActiveButton(button) {
        DOM.navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        state.activeNavButton = button;
        ScriptManager.updateModule();
    },

    toggleActivePage(event) {
        const navItem = event.currentTarget;
        const targetId = navItem.querySelector('button').id.replace('-page-action', '-page');

        DOM.navItems.forEach(item => item.classList.remove('active'));
        DOM.subPages.forEach(page => page.classList.remove('active'));

        navItem.classList.add('active');
        const targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add('active');
    }
};

// Tooltip handler with debouncing
const TooltipManager = {
    activeTooltip: null,
    timeout: null,
    
    init() {
        this.setupTooltips();
        this.setupGlobalEvents();
    },

    setupTooltips() {
        DOM.navItems.forEach(item => {
            const tooltip = item.querySelector('.nav-tooltip');
            
            item.addEventListener('mouseenter', () => this.showTooltip(item, tooltip));
            item.addEventListener('mouseleave', () => this.hideTooltip(tooltip));
            item.addEventListener('mousemove', (e) => this.updateTooltipPosition(item, tooltip, e));
        });
    },

    setupGlobalEvents() {
        // Hide tooltip when scrolling for better performance
        window.addEventListener('scroll', () => {
            if (this.activeTooltip) {
                this.hideTooltip(this.activeTooltip);
            }
        }, { passive: true });
    },

    showTooltip(item, tooltip) {
        clearTimeout(this.timeout);
        
        // Hide any existing tooltip
        if (this.activeTooltip && this.activeTooltip !== tooltip) {
            this.hideTooltip(this.activeTooltip);
        }

        this.activeTooltip = tooltip;
        
        this.timeout = setTimeout(() => {
            const itemRect = item.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Position tooltip
            tooltip.style.left = `${itemRect.right + 15}px`;
            
            // Check if tooltip would go off-screen vertically
            const tooltipHeight = tooltip.offsetHeight;
            let topPosition = itemRect.top + (itemRect.height / 2) - (tooltipHeight / 2);
            
            // Adjust if too close to top or bottom of viewport
            if (topPosition < 10) {
                topPosition = 10;
            } else if (topPosition + tooltipHeight > viewportHeight - 10) {
                topPosition = viewportHeight - tooltipHeight - 10;
            }
            
            tooltip.style.top = `${topPosition}px`;
            
            // Add visible class for animation
            requestAnimationFrame(() => {
                tooltip.classList.add('visible');
            });
        }, 50);
    },

    hideTooltip(tooltip) {
        clearTimeout(this.timeout);
        
        if (tooltip) {
            tooltip.classList.remove('visible');
            this.timeout = setTimeout(() => {
                if (!tooltip.classList.contains('visible')) {
                    tooltip.style.left = '-9999px';
                }
            }, 400); // Match the CSS transition duration
        }
        
        if (this.activeTooltip === tooltip) {
            this.activeTooltip = null;
        }
    },

    updateTooltipPosition(item, tooltip, event) {
        if (tooltip.classList.contains('visible')) {
            const itemRect = item.getBoundingClientRect();
            const tooltipHeight = tooltip.offsetHeight;
            const mouseY = event.clientY;
            
            // Smooth follow for vertical mouse movement
            let topPosition = mouseY - (tooltipHeight / 2);
            
            // Keep tooltip within bounds of the item
            topPosition = Math.max(
                itemRect.top,
                Math.min(topPosition, itemRect.bottom - tooltipHeight)
            );
            
            tooltip.style.top = `${topPosition}px`;
        }
    }
};

// Event listeners
function initializeEventListeners() {
    // Channel selection
    DOM.channelSelect.addEventListener('change', (e) => 
        ScriptManager.updateTitles(e.target.value)
    );

    // Navigation buttons
    DOM.navButtons.forEach(button => {
        button.addEventListener('click', () => 
            NavigationManager.setActiveButton(button)
        );
    });

    // Nav items and tooltips
    DOM.navItems.forEach(item => {
        const tooltip = item.querySelector('.nav-tooltip');
        
        item.addEventListener('click', NavigationManager.toggleActivePage);
        item.addEventListener('mousemove', () => 
            TooltipManager.handleTooltip(item, tooltip, true)
        );
        item.addEventListener('mouseleave', () => 
            TooltipManager.handleTooltip(item, tooltip, false)
        );
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    ScriptManager.updateTitles('all');
    ScriptManager.updateModule();
    TooltipManager.init();
    SearchManager.init();
});
