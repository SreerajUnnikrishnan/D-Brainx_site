import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';

const mainContent = document.getElementById('main-content');
const errorMsg = document.getElementById('error-msg');
const reportsList = document.getElementById('admin-reports-list');
const usersList = document.getElementById('admin-users-list');

// Authentication & Authorization Check
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verify Admin Role
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().role === 'admin') {
                // Authorized
                mainContent.style.display = 'block';
                loadAdminData();
            } else {
                // Unauthorized
                showError("ACCESS DENIED: Insufficient clearance level. Admin role required.");
            }
        } catch (error) {
            console.error("Auth verification error:", error);
            showError("System error during authorization check.");
        }
    } else {
        window.location.href = '/auth.html';
    }
});

function showError(msg) {
    errorMsg.innerHTML = `<h3>${msg}</h3><p style="margin-top:1rem;"><a href="/dashboard.html" class="btn btn-outline">Return to Safety</a></p>`;
}

async function loadAdminData() {
    loadReports();
    loadUsers();
}

async function loadReports() {
    try {
        const q = query(collection(db, "reports"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            reportsList.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align:center;">No reports found in the database.</td></tr>';
            return;
        }

        const reports = [];
        snapshot.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
        // Sort newest first
        reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let html = '';
        reports.forEach(report => {
            const date = new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            html += `
                <tr>
                    <td>${date}</td>
                    <td>${report.userEmail || 'Unknown'}</td>
                    <td style="text-transform: capitalize;">${report.type}</td>
                    <td>${report.target.substring(0, 30)}${report.target.length > 30 ? '...' : ''}</td>
                    <td>
                        <select class="form-control" style="padding: 0.3rem; font-size: 0.8rem; width: auto;" onchange="window.updateStatus('${report.id}', this.value)">
                            <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="investigating" ${report.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                            <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </td>
                    <td>
                        <button class="action-btn" onclick="alert('Description:\\n\\n${report.description.replace(/'/g, "\\'")}')">View Details</button>
                    </td>
                </tr>
            `;
        });

        reportsList.innerHTML = html;

    } catch (error) {
        console.error("Error loading reports:", error);
        reportsList.innerHTML = '<tr><td colspan="6" class="text-muted" style="text-align:center;">Failed to fetch report data.</td></tr>';
    }
}

async function loadUsers() {
    try {
        const snapshot = await getDocs(collection(db, "users"));

        if (snapshot.empty) {
            usersList.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;">No users found.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
            const roleColor = user.role === 'admin' ? '#ef4444' : (user.role === 'hacker' ? 'var(--neon-purple)' : 'var(--text-main)');

            html += `
                <tr>
                    <td>${date}</td>
                    <td>${user.name || 'Agent'}</td>
                    <td>${user.email}</td>
                    <td style="text-transform: uppercase; color: ${roleColor}; font-weight: bold;">${user.role || 'user'}</td>
                </tr>
            `;
        });

        usersList.innerHTML = html;

    } catch (error) {
        console.error("Error loading users:", error);
        usersList.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;">Failed to fetch user directory.</td></tr>';
    }
}

// Global function attached to window so inline onclick can use it
window.updateStatus = async (reportId, newStatus) => {
    try {
        const reportRef = doc(db, "reports", reportId);
        await updateDoc(reportRef, {
            status: newStatus
        });
        // Visual feedback could be added here
        console.log(`Report ${reportId} updated to ${newStatus}`);
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status. Please try again.");
    }
};
