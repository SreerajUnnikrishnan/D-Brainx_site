import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const switchSignup = document.getElementById('switch-to-signup');
const switchLogin = document.getElementById('switch-to-login');
const errorMsg = document.getElementById('auth-error');

// Check URL parameters for signup redirect
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'true') {
        showSignup();
    }
});

// UI Switching Logic
function showSignup(e) {
    if (e) e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    errorMsg.textContent = '';
}

function showLogin(e) {
    if (e) e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    tabSignup.classList.remove('active');
    tabLogin.classList.add('active');
    errorMsg.textContent = '';
}

if (tabLogin) tabLogin.addEventListener('click', showLogin);
if (tabSignup) tabSignup.addEventListener('click', showSignup);
if (switchSignup) switchSignup.addEventListener('click', showSignup);
if (switchLogin) switchLogin.addEventListener('click', showLogin);

// Firebase Auth Logic

// Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');

        try {
            btn.textContent = 'Authenticating...';
            btn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            // Redirect will be handled by onAuthStateChanged, or manually here
            window.location.href = '/dashboard.html';

        } catch (error) {
            console.error("Login Error:", error);
            errorMsg.textContent = error.message;
            btn.textContent = 'Initialize Connection';
            btn.disabled = false;
        }
    });
}

// Sign Up
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;
        const btn = signupForm.querySelector('button');

        try {
            btn.textContent = 'Creating Clearance...';
            btn.disabled = true;

            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Save User Profile in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            });

            // 3. Redirect to dashboard
            window.location.href = '/dashboard.html';

        } catch (error) {
            console.error("Signup Error:", error);
            errorMsg.textContent = error.message;
            btn.textContent = 'Create Clearance';
            btn.disabled = false;
        }
    });
}

// Global Auth State Listener
onAuthStateChanged(auth, (user) => {
    // If user is already logged in and on auth page, redirect to dashboard
    if (user && window.location.pathname.includes('auth.html')) {
        window.location.href = '/dashboard.html';
    }
});
