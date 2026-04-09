import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const userNameDisplay = document.getElementById('user-display-name');
const roleLinks = document.getElementById('role-links');
const statRole = document.getElementById('stat-role');
const statReports = document.getElementById('stat-reports');

// Sections
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sections = document.querySelectorAll('.content-section');

// Form
const incidentForm = document.getElementById('incident-form');
const reportMsg = document.getElementById('report-msg');
const reportsList = document.getElementById('reports-list');

let currentUser = null;
let userProfile = null;

// Ensure user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Fetch user profile from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            userProfile = docSnap.data();
            initDashboard();
        } else {
            console.error("User profile not found in database!");
            userNameDisplay.textContent = user.email;
        }
    } else {
        // Not logged in, redirect to auth
        window.location.href = '/auth.html';
    }
});

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    });
}

// Initialize Dashboard UI based on User Profile
function initDashboard() {
    userNameDisplay.textContent = `Agent ${userProfile.name.split(' ')[0]}`;
    statRole.textContent = userProfile.role.toUpperCase();

    // Inject Admin/Hacker tabs if necessary
    if (userProfile.role === 'admin') {
        roleLinks.innerHTML += `
            <a href="/admin.html" class="sidebar-link" style="text-decoration: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Admin Panel
            </a>
        `;
    }

    if (userProfile.role === 'hacker') {
        roleLinks.innerHTML += `
            <a href="/hacker-portal.html" class="sidebar-link" style="text-decoration: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Hacker Workspace
            </a>
        `;
    }

    loadMyReports();
}

// Sidebar Navigation Logic
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from all links and sections
        sidebarLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        // Add active class to clicked link
        link.classList.add('active');

        // Show target section
        const targetId = link.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        if (targetId === 'my-reports') loadMyReports();
    });
});

// Submit Incident Report
if (incidentForm) {
    incidentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) return;

        const type = document.getElementById('incident-type').value;
        const desc = document.getElementById('incident-desc').value;
        const target = document.getElementById('incident-target').value;
        const btn = incidentForm.querySelector('button');

        try {
            btn.disabled = true;
            btn.textContent = 'Transmitting...';
            reportMsg.textContent = '';
            reportMsg.style.color = '';

            await addDoc(collection(db, "reports"), {
                userId: currentUser.uid,
                userName: userProfile.name,
                userEmail: userProfile.email,
                type: type,
                description: desc,
                target: target,
                status: 'pending', // pending, investigating, resolved
                createdAt: new Date().toISOString()
            });

            reportMsg.textContent = 'Report transmitted securely to our intelligence team.';
            reportMsg.style.color = 'var(--neon-cyan)';
            incidentForm.reset();

            // Update stats
            loadMyReports();

        } catch (error) {
            console.error("Error submitting report: ", error);
            reportMsg.textContent = 'Transmission failed. Ensure secure connection.';
            reportMsg.style.color = '#ef4444';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Submit Report';
        }
    });
}

// Load User's Reports
async function loadMyReports() {
    if (!currentUser) return;

    try {
        const q = query(collection(db, "reports"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        statReports.textContent = querySnapshot.size;

        if (querySnapshot.empty) {
            reportsList.innerHTML = '<p class="text-muted">No incidents reported on this frequency.</p>';
            return;
        }

        let html = '';
        // Note: Without composite indexes, ordering by client side for simplicity here
        const reports = [];
        querySnapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() });
        });

        reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        reports.forEach(report => {
            const date = new Date(report.createdAt).toLocaleDateString();

            let statusColor = 'var(--text-muted)';
            if (report.status === 'pending') statusColor = '#f59e0b'; // Amber
            if (report.status === 'investigating') statusColor = 'var(--neon-blue)';
            if (report.status === 'resolved') statusColor = '#10b981'; // Green

            html += `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>${report.type.toUpperCase()}</strong>
                        <span style="color: ${statusColor}; font-family: var(--font-mono); font-size: 0.8rem;">[${report.status.toUpperCase()}]</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">Target: ${report.target}</p>
                    <p style="font-size: 0.9rem;">${report.description}</p>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem; text-align: right;">Reported: ${date}</div>
                </div>
            `;
        });

        reportsList.innerHTML = html;

    } catch (error) {
        console.error("Error fetching reports:", error);
        reportsList.innerHTML = '<p class="text-muted">Error accessing report database.</p>';
    }
}
