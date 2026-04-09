import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const payBtns = document.querySelectorAll('.pay-btn');
const paymentMsg = document.getElementById('payment-msg');

let currentUser = null;
let userProfile = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            userProfile = docSnap.data();
        }
    }
});

// Since Razorpay requires backend generation of order_id for production security,
// we will build a frontend-only mockup using Razorpay Checkout in 'test' mode.
payBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {

        if (!currentUser || !userProfile) {
            alert("Clearance Required: Please login or register to initialize a security protocol.");
            window.location.href = '/auth.html';
            return;
        }

        const amount = e.target.getAttribute('data-amount');
        const planName = e.target.getAttribute('data-plan');

        paymentMsg.innerHTML = '<span class="text-neon pulse" style="display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:8px;"></span> Establishing secure payment gateway...';

        // Razorpay Options
        const options = {
            "key": import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_placeholderKey", // Replace env in real usage
            "amount": amount * 100, // amount in paisa
            "currency": "INR",
            "name": "BrainX Cybersecurity",
            "description": `${planName} License`,
            "image": "/vite.svg",
            "handler": async function (response) {
                // Payment Success Handler
                try {
                    // Update user subscription in firestore
                    const userRef = doc(db, "users", currentUser.uid);
                    await updateDoc(userRef, {
                        subscription: planName,
                        paymentId: response.razorpay_payment_id
                    });

                    paymentMsg.innerHTML = `<span style="color:#10b981;">Transaction Secured. Payment ID: ${response.razorpay_payment_id}. Protocol fully initialized.</span>`;
                } catch (error) {
                    console.error("Error updating user record:", error);
                    paymentMsg.innerHTML = `<span style="color:#ef4444;">Payment captured but profile update failed. Contact support with ID: ${response.razorpay_payment_id}</span>`;
                }
            },
            "prefill": {
                "name": userProfile.name,
                "email": userProfile.email
            },
            "theme": {
                "color": "#38bdf8" // Neon blue
            }
        };

        // Open Razorpay Checkout
        try {
            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                paymentMsg.innerHTML = `<span style="color:#ef4444;">Transaction Aborted: ${response.error.description}</span>`;
            });

            rzp.open();
        } catch (error) {
            console.error("Razorpay Error:", error);
            paymentMsg.innerHTML = '<span style="color:#ef4444;">Failed to initialize secure gateway via Razorpay script. Ensure internet connection.</span>';
        }
    });
});
