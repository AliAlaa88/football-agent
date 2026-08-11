// Generate or retrieve a random session ID to maintain chat memory in Supabase
function getSessionId() {
    let sessionId = localStorage.getItem('barca_session_id');
    if (!sessionId) {
        // Generate random 9-digit ID to mimic Telegram chatId
        sessionId = Math.floor(Math.random() * 1000000000).toString();
        localStorage.setItem('barca_session_id', sessionId);
    }
    return sessionId;
}

const sessionId = getSessionId();
const chatFeed = document.getElementById('chat-feed');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

function scrollToBottom() {
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.innerHTML = `<div class="message-content">${escapeHTML(text)}</div>`;
    chatFeed.appendChild(msgDiv);
    scrollToBottom();
}

function appendAssistantMessage(text, toolsUsed = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant';
    
    let html = `<div class="message-content">${escapeHTML(text)}</div>`;
    
    if (toolsUsed && toolsUsed.length > 0) {
        html += `<div class="tool-labels">`;
        toolsUsed.forEach(tool => {
            html += `<span class="tool-badge">${escapeHTML(tool)}</span>`;
        });
        html += `</div>`;
    }
    
    msgDiv.innerHTML = html;
    chatFeed.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant typing';
    msgDiv.id = 'typing-indicator';
    msgDiv.innerHTML = `
        <div class="message-content typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    chatFeed.appendChild(msgDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // UI Updates
    appendUserMessage(message);
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, sessionId })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator();
        
        if (data.reply) {
            appendAssistantMessage(data.reply, data.toolsUsed);
        } else {
            appendAssistantMessage("I'm sorry, I couldn't generate a response.");
        }
    } catch (error) {
        console.error("Chat error:", error);
        removeTypingIndicator();
        appendAssistantMessage("⚠️ Connection error. Please try again.");
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
});
