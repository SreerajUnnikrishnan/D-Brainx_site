import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        // Redirect to login if not authenticated
        window.location.href = '/auth.html';
    }
});

// UI interaction
const hackerCards = document.querySelectorAll('.hacker-card');
hackerCards.forEach(card => {
    card.addEventListener('click', () => {
        hackerCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Update header
        const name = card.querySelector('h4').textContent;
        const avatar = card.querySelector('.hacker-avatar').textContent;
        const color = card.querySelector('.hacker-avatar').style.color;

        document.getElementById('active-chat-name').textContent = name;
        const headerAvatar = document.getElementById('active-chat-avatar');
        headerAvatar.textContent = avatar;
        if (color) headerAvatar.style.color = color;

        // Clear mock messages for mockup effect
        chatMessages.innerHTML = `
            <div class="message received">
              Secure communication line open with ${name}. State your request.
              <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    });
});

// Simple Mockup Chat sending
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;

        // Add sent message
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgHtml = `
            <div class="message sent">
              ${text}
              <div class="message-time">${time}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', msgHtml);
        messageInput.value = '';

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Mock Hacker Response
        setTimeout(() => {
            const replyHtml = `
                <div class="message received">
                  I am analyzing the transmitted data. Please stand by.
                  <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', replyHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
    });
}
