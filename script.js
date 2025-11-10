// Global variables
let currentSearchMode = 'semantic';
let apiBaseUrl = 'https://pton4fs50l0n4l-8000.proxy.runpod.net';

// Load API URL from localStorage on startup
const savedApiUrl = localStorage.getItem('docuchat_api_url');
if (savedApiUrl) {
    apiBaseUrl = savedApiUrl;
}

// DOM elements
let sidebar, sidebarToggle, helpButton, helpPopup, closeHelp, introPopup, closeIntro, continueButton;
let loadingOverlay, chatMessages, messageInput, sendButton, searchModeButtons;
let chatScroll;
let documentIdsContainer, documentIdsInput, topKSlider, scoreThresholdSlider;
let topKValue, scoreThresholdValue, topKFill, scoreThresholdFill, resetParams;
let configButton, configPopup, closeConfig, apiEndpointInput, testConnectionButton, saveConfigButton;
let statusIndicator, statusText;
let pagePopup, closePagePopupBtn, pageDocIdEl, copyDocIdBtn, pageFileNameEl, pageMetaEl, pageKeywordEl, pagePreviewTextEl;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeSliders();
    setupEventListeners();
    showIntroPopup();
});

function initializeElements() {
    sidebar = document.getElementById('sidebar');
    sidebarToggle = document.getElementById('sidebar_toggle');
    helpButton = document.getElementById('help_button');
    helpPopup = document.getElementById('help_popup');
    closeHelp = document.getElementById('close_help');
    introPopup = document.getElementById('intro_popup');
    closeIntro = document.getElementById('close_intro');
    continueButton = document.getElementById('continue_button');
    loadingOverlay = document.getElementById('loading_overlay');
    chatMessages = document.getElementById('chat_messages');
    chatScroll = document.getElementById('chat_scroll');
    messageInput = document.getElementById('message_input');
    sendButton = document.getElementById('send_button');
    searchModeButtons = document.querySelectorAll('.search-mode-btn');
    documentIdsContainer = document.getElementById('document_ids_container');
    documentIdsInput = document.getElementById('document_ids_input');
    topKSlider = document.getElementById('top_k');
    scoreThresholdSlider = document.getElementById('score_threshold');
    topKValue = document.getElementById('top_k_value');
    scoreThresholdValue = document.getElementById('score_threshold_value');
    topKFill = document.getElementById('top_k_fill');
    scoreThresholdFill = document.getElementById('score_threshold_fill');
    resetParams = document.getElementById('reset_params');
    configButton = document.getElementById('config_button');
    configPopup = document.getElementById('config_popup');
    closeConfig = document.getElementById('close_config');
    apiEndpointInput = document.getElementById('api_endpoint');
    testConnectionButton = document.getElementById('test_connection');
    saveConfigButton = document.getElementById('save_config');
    statusIndicator = document.getElementById('status_indicator');
    statusText = document.getElementById('status_text');
    pagePopup = document.getElementById('page_popup');
    closePagePopupBtn = document.getElementById('close_page_popup');
    pageDocIdEl = document.getElementById('page_doc_id');
    copyDocIdBtn = document.getElementById('copy_doc_id');
    pageFileNameEl = document.getElementById('page_file_name');
    pageMetaEl = document.getElementById('page_meta');
    pageKeywordEl = document.getElementById('page_keyword');
    pagePreviewTextEl = document.getElementById('page_preview_text');
}

function initializeSliders() {
    // Top K slider
    topKSlider.addEventListener('input', function() {
        const value = this.value;
        topKValue.textContent = value;
        const percentage = ((value - 1) / (20 - 1)) * 100;
        topKFill.style.width = percentage + '%';
        
        // Update thumb position
        const thumb = topKSlider.parentElement.querySelector('.slider-thumb');
        if (thumb) {
            thumb.style.left = percentage + '%';
        }
    });
    
    // Score threshold slider
    scoreThresholdSlider.addEventListener('input', function() {
        const value = parseFloat(this.value).toFixed(2);
        scoreThresholdValue.textContent = value;
        const percentage = (value / 1) * 100;
        scoreThresholdFill.style.width = percentage + '%';
        
        // Update thumb position
        const thumb = scoreThresholdSlider.parentElement.querySelector('.slider-thumb');
        if (thumb) {
            thumb.style.left = percentage + '%';
        }
    });
    
    // Initialize slider positions
    updateSliderPositions();
}

function updateSliderPositions() {
    // Update top K slider
    const topKVal = topKSlider.value;
    topKValue.textContent = topKVal;
    const topKPercentage = ((topKVal - 1) / (20 - 1)) * 100;
    topKFill.style.width = topKPercentage + '%';
    
    // Update top K thumb position
    const topKThumb = topKSlider.parentElement.querySelector('.slider-thumb');
    if (topKThumb) {
        topKThumb.style.left = topKPercentage + '%';
    }
    
    // Update score threshold slider
    const scoreVal = parseFloat(scoreThresholdSlider.value).toFixed(2);
    scoreThresholdValue.textContent = scoreVal;
    const scorePercentage = (scoreVal / 1) * 100;
    scoreThresholdFill.style.width = scorePercentage + '%';
    
    // Update score threshold thumb position
    const scoreThumb = scoreThresholdSlider.parentElement.querySelector('.slider-thumb');
    if (scoreThumb) {
        scoreThumb.style.left = scorePercentage + '%';
    }
}

function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-mobile-hidden');
    });
    
    // Help popup
    helpButton.addEventListener('click', function() {
        helpPopup.classList.remove('hidden');
        helpPopup.classList.add('animate-fade-in');
    });
    
    closeHelp.addEventListener('click', function() {
        helpPopup.classList.add('hidden');
    });
    
    // Config popup
    configButton.addEventListener('click', function() {
        // Load current API URL into input
        apiEndpointInput.value = apiBaseUrl;
        configPopup.classList.remove('hidden');
        configPopup.classList.add('animate-fade-in');
    });
    
    closeConfig.addEventListener('click', function() {
        configPopup.classList.add('hidden');
    });
    
    // Test connection
    testConnectionButton.addEventListener('click', testApiConnection);
    
    // Save config
    saveConfigButton.addEventListener('click', saveConfiguration);

    // Page popup
    closePagePopupBtn.addEventListener('click', () => hidePagePopup());
    pagePopup.addEventListener('click', function(e) {
        if (e.target === this) hidePagePopup();
    });
    copyDocIdBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(pageDocIdEl.textContent);
            copyDocIdBtn.classList.add('ring-2','ring-primary');
            setTimeout(() => copyDocIdBtn.classList.remove('ring-2','ring-primary'), 600);
        } catch (_) {}
    });
    
    // Intro popup
    closeIntro.addEventListener('click', function() {
        hideIntroPopup();
    });
    
    continueButton.addEventListener('click', function() {
        hideIntroPopup();
    });
    
    // Search mode buttons
    searchModeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.dataset.mode;
            setSearchMode(mode);
        });
    });
    
    // Send message
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Reset parameters
    resetParams.addEventListener('click', function() {
        topKSlider.value = 5;
        scoreThresholdSlider.value = 0.5;
        updateSliderPositions();
    });
    
    // Close popups when clicking outside
    helpPopup.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
    
    configPopup.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
    
    introPopup.addEventListener('click', function(e) {
        if (e.target === this) {
            hideIntroPopup();
        }
    });
}

function showIntroPopup() {
    introPopup.classList.remove('hidden');
}

function hideIntroPopup() {
    introPopup.classList.add('hidden');
}

function setSearchMode(mode) {
    currentSearchMode = mode;
    
    // Update button states
    searchModeButtons.forEach(button => {
        if (button.dataset.mode === mode) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Show/hide document IDs input
    if (mode === 'specific') {
        documentIdsContainer.classList.remove('hidden');
        documentIdsInput.focus();
    } else {
        documentIdsContainer.classList.add('hidden');
        messageInput.focus();
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage('user', message);
    messageInput.value = '';
    
    // Show loading
    showLoading();
    
    try {
        let response;
        const topK = parseInt(topKSlider.value);
        const scoreThreshold = parseFloat(scoreThresholdSlider.value);
        
        switch (currentSearchMode) {
            case 'semantic':
                response = await fetch(`${apiBaseUrl}/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: message,
                        top_k: topK,
                        score_threshold: scoreThreshold
                    })
                });
                break;
                
            case 'keyword':
                response = await fetch(`${apiBaseUrl}/search/keyword`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        keyword: message,
                        top_k: topK,
                        case_sensitive: false
                    })
                });
                break;
                
            case 'specific':
                const documentIds = documentIdsInput.value.trim().split(',').map(id => id.trim()).filter(id => id);
                if (documentIds.length === 0) {
                    addMessage('bot', 'Please enter document IDs separated by commas.');
                    hideLoading();
                    return;
                }
                response = await fetch(`${apiBaseUrl}/search/specific`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: message,
                        document_ids: documentIds,
                        top_k: topK
                    })
                });
                break;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (currentSearchMode === 'keyword' && data && data.files) {
            addMessage('bot', createKeywordResultsElement(data));
        } else if (currentSearchMode === 'semantic' && data && (Array.isArray(data.sources) || Array.isArray(data.document_ids))) {
            addMessage('bot', createSemanticResponseElement(data));
        } else {
            addMessage('bot', data.answer || data.message || 'No response received.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('bot', `Error: ${error.message}. Please make sure the API server is running on ${apiBaseUrl}`);
    } finally {
        hideLoading();
    }
}

function addMessage(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-end gap-3 p-2 message-enter';
    
    if (sender === 'user') {
        messageDiv.classList.add('justify-end');
        messageDiv.innerHTML = `
            <div class="flex flex-1 flex-col gap-1 items-end">
                <p class="text-xs font-medium leading-normal text-white/50">You</p>
                <div class="text-base font-normal leading-relaxed flex max-w-md rounded-xl rounded-br-sm px-4 py-2.5 bg-[#2a2a2a] text-white">
                    ${typeof content === 'string' ? escapeHtml(content) : ''}
                </div>
            </div>
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 border border-white/10" data-alt="User avatar" style='background-image: url("usericon.png");'></div>
        `;
        if (typeof content !== 'string') {
            const bubble = messageDiv.querySelector('.text-base');
            bubble.textContent = '';
            bubble.appendChild(content);
        }
    } else {
        messageDiv.innerHTML = `
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 border border-white/10" data-alt="AI assistant avatar" style='background-image: url("agenticon.png");'></div>
            <div class="flex flex-1 flex-col gap-1 items-start">
                <p class="text-xs font-medium leading-normal text-white/50">Onyx AI Agent</p>
                <div class="text-base font-normal leading-relaxed flex max-w-md rounded-xl rounded-bl-sm px-4 py-2.5 bg-[#1e1e1e] text-white">
                    ${typeof content === 'string' ? escapeHtml(content) : ''}
                </div>
            </div>
        `;
        if (typeof content !== 'string') {
            const bubble = messageDiv.querySelector('.text-base');
            bubble.textContent = '';
            bubble.appendChild(content);
        }
    }
    
    chatMessages.appendChild(messageDiv);
    // Scroll the scrollable container, not the messages div
    if (chatScroll) {
        chatScroll.scrollTop = chatScroll.scrollHeight;
    } else {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Build a rich result element for keyword search results
function createKeywordResultsElement(result) {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-3 w-full';

    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between w-full';
    header.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sapphire">key</span>
            <span class="text-white font-medium">Keyword</span>
            <span class="text-white/80">"${escapeHtml(result.keyword || '')}"</span>
        </div>
        <div class="text-white/60 text-sm">${result.total_files_found || 0} file(s)</div>
    `;
    container.appendChild(header);

    // Files list
    (result.files || []).forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'rounded-lg bg-[#171717] border border-white/10 p-3';
        const totalOcc = file.total_occurrences || 0;
        const pageCount = file.page_count || (file.pages ? file.pages.length : 0);
        fileCard.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-white font-medium truncate max-w-[200px]">${escapeHtml(file.source || 'Unknown')}</div>
                <div class="text-white/60 text-xs">${totalOcc} occurrence(s) • ${pageCount} page(s)</div>
            </div>
            <div class="mt-2 flex flex-wrap gap-2"></div>
        `;
        const chipsRow = fileCard.lastElementChild;
        (file.pages || []).forEach(pg => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'px-2 py-1 rounded-md bg-[#222222] text-white/80 text-xs border border-white/10 hover:bg-[#262626] active:scale-[0.98] transition';
            chip.textContent = `p${pg.page_num} (${pg.occurrences})`;
            chip.title = pg.id || '';
            chip.addEventListener('click', () => {
                showPagePopup({
                    id: pg.id,
                    page_num: pg.page_num,
                    occurrences: pg.occurrences,
                    text: pg.text || ''
                }, file.source || 'Document', result.keyword || '');
            });
            chipsRow.appendChild(chip);
        });
        container.appendChild(fileCard);
    });

    // Timestamp
    if (result.timestamp) {
        const ts = document.createElement('div');
        ts.className = 'text-white/40 text-xs';
        ts.textContent = new Date(result.timestamp).toLocaleString();
        container.appendChild(ts);
    }

    return container;
}

function createSemanticResponseElement(result) {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-3 w-full';

    const answerText = result.answer || result.message;
    const structuredAnswer = answerText ? parseStructuredSemanticAnswer(answerText) : null;

    if (structuredAnswer) {
        container.appendChild(createStructuredAnswerElement(structuredAnswer));
    } else if (answerText) {
        const answerEl = document.createElement('p');
        answerEl.className = 'text-white/90 whitespace-pre-line';
        answerEl.textContent = answerText;
        container.appendChild(answerEl);
    }

    const sources = Array.isArray(result.sources) ? result.sources : [];
    const docIds = Array.isArray(result.document_ids) ? result.document_ids : [];

    if (sources.length || docIds.length) {
        const summaryCard = document.createElement('div');
        summaryCard.className = 'flex flex-col gap-3 rounded-lg bg-[#171717] border border-white/10 p-3';

        const header = document.createElement('div');
        header.className = 'flex items-center justify-between';
        const counts = [];
        if (sources.length) {
            counts.push(`${sources.length} doc${sources.length === 1 ? '' : 's'}`);
        }
        if (docIds.length) {
            counts.push(`${docIds.length} paragraph id${docIds.length === 1 ? '' : 's'}`);
        }
        header.innerHTML = `
            <span class="text-white/70 text-xs uppercase tracking-[0.2em]">מקורות</span>
            <span class="text-white/50 text-xs">${counts.join(' • ')}</span>
        `;
        summaryCard.appendChild(header);

        if (sources.length) {
            const docsLine = document.createElement('p');
            docsLine.className = 'text-white text-sm leading-relaxed';
            docsLine.textContent = `In the docs: ${sources.join(', ')}`;
            summaryCard.appendChild(docsLine);
        }

        if (docIds.length) {
            const idsLabel = document.createElement('p');
            idsLabel.className = 'text-white/80 text-sm leading-relaxed';
            idsLabel.textContent = 'In these paragraph IDs we found the answers:';
            summaryCard.appendChild(idsLabel);

            const idsRow = document.createElement('div');
            idsRow.className = 'flex flex-wrap gap-2';

            docIds.forEach(id => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'px-2 py-1 rounded-md bg-[#222222] text-white/80 text-xs border border-white/10 hover:bg-[#262626] active:scale-[0.98] transition';
                chip.textContent = id;
                chip.title = 'Copy paragraph ID';
                chip.addEventListener('click', () => copyToClipboard(id, chip));
                idsRow.appendChild(chip);
            });

            summaryCard.appendChild(idsRow);
        }

        container.appendChild(summaryCard);
    }

    const metaBits = [];
    if (result.confidence) {
        metaBits.push(`Confidence: ${formatConfidenceLabel(result.confidence)}`);
    }
    if (typeof result.num_documents_used === 'number') {
        metaBits.push(`${result.num_documents_used} document${result.num_documents_used === 1 ? '' : 's'} used`);
    }
    if (result.timestamp) {
        const timestamp = new Date(result.timestamp);
        if (!isNaN(timestamp.getTime())) {
            metaBits.push(timestamp.toLocaleString());
        }
    }

    if (metaBits.length) {
        const metaEl = document.createElement('div');
        metaEl.className = 'text-white/40 text-xs';
        metaEl.textContent = metaBits.join(' • ');
        container.appendChild(metaEl);
    }

    return container;
}

function formatConfidenceLabel(confidence) {
    const label = String(confidence || '').trim();
    if (!label) return '';
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function parseStructuredSemanticAnswer(answer) {
    if (!answer) return null;
    const lines = answer.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) return null;

    const knownSections = ['summary', 'relevant clauses', 'conditions', 'confidence'];
    const sections = {};
    let currentKey = null;

    lines.forEach(line => {
        const match = line.match(/^([A-Za-z\s]+):\s*(.*)$/);
        if (match) {
            const rawKey = match[1].toLowerCase();
            if (knownSections.includes(rawKey)) {
                currentKey = rawKey.replace(/\s+/g, '_');
                const initialValue = match[2] || '';
                sections[currentKey] = initialValue ? [initialValue] : [];
                return;
            }
        }
        if (currentKey) {
            sections[currentKey].push(line);
        }
    });

    if (!Object.keys(sections).length) return null;

    Object.keys(sections).forEach(key => {
        sections[key] = sections[key].join('\n').trim();
    });

    return sections;
}

function createStructuredAnswerElement(sections) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-3';

    if (sections.summary) {
        wrapper.appendChild(createSectionCard('סיכום', sections.summary));
    }

    if (sections.relevant_clauses) {
        const clausesCard = createSectionCard('סעיפים רלוונטיים', sections.relevant_clauses);
        clausesCard.classList.add('bg-[#171717]');
        const body = clausesCard.querySelector('[data-section-body]');
        if (body) {
            body.classList.add('whitespace-pre-line', 'text-sm', 'leading-relaxed');
        }
        wrapper.appendChild(clausesCard);
    }

    if (sections.conditions) {
        const conditionsCard = createSectionCard('תנאים', sections.conditions);
        wrapper.appendChild(conditionsCard);
    }

    if (sections.confidence) {
        const confidenceCard = document.createElement('div');
        confidenceCard.className = 'flex items-center gap-2';

        const label = document.createElement('span');
        label.className = 'text-white/70 text-xs uppercase tracking-[0.2em]';
        label.textContent = 'רמת סמך';

        const pill = document.createElement('span');
        pill.className = 'px-3 py-1 rounded-full bg-[#222222] border border-white/10 text-white text-sm';
        pill.textContent = sections.confidence;

        confidenceCard.appendChild(label);
        confidenceCard.appendChild(pill);
        wrapper.appendChild(confidenceCard);
    }

    return wrapper;
}

function createSectionCard(title, content) {
    const card = document.createElement('div');
    card.className = 'flex flex-col gap-2 rounded-lg bg-[#1e1e1e] border border-white/10 p-3';

    const header = document.createElement('div');
    header.className = 'text-white/70 text-xs uppercase tracking-[0.2em]';
    header.textContent = title;

    const body = document.createElement('p');
    body.setAttribute('data-section-body', 'true');
    body.className = 'text-white text-sm leading-relaxed whitespace-pre-line';
    body.textContent = content;

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

async function copyToClipboard(text, buttonEl) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        if (buttonEl) {
            buttonEl.classList.add('ring-2', 'ring-primary');
            setTimeout(() => buttonEl.classList.remove('ring-2', 'ring-primary'), 600);
        }
    } catch (_) {
        // No-op: clipboard might be unavailable
    }
}

function showPagePopup(page, fileSource, keyword) {
    if (!pagePopup) return;
    pageFileNameEl.textContent = fileSource;
    pageKeywordEl.textContent = `מילת חיפוש: "${keyword}"`;
    pageMetaEl.textContent = `עמוד ${page.page_num} • ${page.occurrences} הופעות`;
    pageDocIdEl.textContent = page.id || '';
    pagePreviewTextEl.textContent = page.text || '';
    pagePopup.classList.remove('hidden');
    pagePopup.classList.add('flex');
}

function hidePagePopup() {
    if (!pagePopup) return;
    pagePopup.classList.add('hidden');
    pagePopup.classList.remove('flex');
}

// Config functions
async function testApiConnection() {
    const testUrl = apiEndpointInput.value.trim();
    if (!testUrl) {
        updateConnectionStatus('error', 'Please enter a URL');
        return;
    }
    
    updateConnectionStatus('testing', 'Testing connection...');
    
    try {
        // Test with a simple health check or any endpoint
        const response = await fetch(`${testUrl}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'test',
                top_k: 1,
                score_threshold: 0.1
            })
        });
        
        if (response.ok) {
            updateConnectionStatus('success', 'Connection successful!');
        } else {
            updateConnectionStatus('error', `Server responded with status: ${response.status}`);
        }
    } catch (error) {
        updateConnectionStatus('error', `Connection failed: ${error.message}`);
    }
}

function updateConnectionStatus(status, message) {
    statusText.textContent = message;
    
    // Remove all status classes
    statusIndicator.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500');
    
    switch (status) {
        case 'success':
            statusIndicator.classList.add('bg-green-500');
            break;
        case 'error':
            statusIndicator.classList.add('bg-red-500');
            break;
        case 'testing':
            statusIndicator.classList.add('bg-blue-500');
            break;
        default:
            statusIndicator.classList.add('bg-yellow-500');
    }
}

function saveConfiguration() {
    const newApiUrl = apiEndpointInput.value.trim();
    
    if (!newApiUrl) {
        alert('Please enter a valid API URL');
        return;
    }
    
    // Validate URL format
    try {
        new URL(newApiUrl);
    } catch (e) {
        alert('Please enter a valid URL format (e.g., https://pton4fs50l0n4l-8000.proxy.runpod.net)');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('docuchat_api_url', newApiUrl);
    apiBaseUrl = newApiUrl;
    
    // Close popup
    configPopup.classList.add('hidden');
    
    // Show success message
    addMessage('bot', `API endpoint updated to: ${newApiUrl}`);
}

// Auto-focus message input
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (messageInput) {
            messageInput.focus();
        }
    }, 100);
});
