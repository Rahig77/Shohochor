/* ==========================================================================
   DiSSCU App - Real Firebase Backend (database.js)
   Features: Advanced Auth, Request Engine, Auto-expiration (14 days),
             Real-time Combined Feed/Notifications, Filtering & XSS Prevention.
   ========================================================================== */

// ==========================================
// 1. Firebase Configuration & Initialization
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBzpPGaVGB7HsRzRF1r4u_OB-MquXVF5Ok",
    authDomain: "disscu.firebaseapp.com",
    projectId: "disscu",
    storageBucket: "disscu.firebasestorage.app",
    messagingSenderId: "222186448779",
    appId: "1:222186448779:web:2007a32eefbda948af318e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ==========================================
// 2. Global Variables & Constants
// ==========================================
const SUPER_ADMIN_EMAIL = "rahigchowdhury29@gmail.com";
let currentUserData = null;
let currentUserId = null;

// Local arrays for real-time combined feed
let localRequests = [];
let localApprovals = [];

// Default Filters
let currentNotifFilter = 'all';
let currentFeedFilter = 'all';

// ==========================================
// 3. Helper Functions (Security & Utility)
// ==========================================
// A. XSS Protection: Escapes user input before injecting into HTML
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// B. 14 Days Expiration Timestamp
function get14DaysAgoTimestamp() {
    return firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
}

// C. Confirmation Dialog Wrapper
function confirmAction(message) {
    return window.confirm(message);
}

// ==========================================
// 4. Authentication Logic (Login, Reg, Google)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // --- A. Email/Password Registration ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const gender = document.querySelector('input[name="reg_gender"]:checked').value;
            const password = document.getElementById('reg-password').value;
            const role = document.querySelector('input[name="reg_type"]:checked').value;
            const terms = document.getElementById('reg-terms').checked;

            if (!terms) {
                alert("You must accept the Terms and Conditions."); return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    return user.sendEmailVerification().then(() => {
                        return db.collection('users').doc(user.uid).set({
                            name: escapeHTML(name), email: email, phone: escapeHTML(phone), gender: gender,
                            role: role, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            dept: "", session: "", roll: "", year_semester: ""
                        });
                    });
                })
                .then(() => {
                    alert("Registration Successful! Please check your email to VERIFY your account.");
                    auth.signOut(); registerForm.reset();
                })
                .catch(error => alert("Registration Error: " + error.message));
        });
    }

    // --- B. Email/Password Login ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (!user.emailVerified && user.email !== SUPER_ADMIN_EMAIL) {
                        alert("Please verify your email address first!"); auth.signOut();
                    } else {
                        loginForm.reset();
                    }
                })
                .catch(error => alert("Login Error: " + error.message));
        });
    }

    // --- C. Google Login & Onboarding ---
    const googleBtn = document.getElementById('btn-google-login');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            auth.signInWithPopup(googleProvider).then((result) => {
                const user = result.user;
                db.collection('users').doc(user.uid).get().then((doc) => {
                    if (!doc.exists) {
                        window.navigateTo('screen-onboarding'); // Show Onboarding for new users
                    }
                });
            }).catch(error => alert("Google Sign-In Error: " + error.message));
        });
    }

    const onboardForm = document.getElementById('form-onboarding');
    if (onboardForm) {
        onboardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;

            const phone = document.getElementById('onboard-phone').value;
            const gender = document.querySelector('input[name="onboard_gender"]:checked').value;
            const role = document.querySelector('input[name="onboard_type"]:checked').value;

            db.collection('users').doc(user.uid).set({
                name: escapeHTML(user.displayName || "Google User"), email: user.email,
                phone: escapeHTML(phone), gender: gender, role: role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                dept: "", session: "", roll: "", year_semester: ""
            }).then(() => {
                alert("Profile completed successfully!");
                loadUserDataAndRedirect(user);
            }).catch(err => alert("Error: " + err.message));
        });
    }

    // --- D. Forgot Password & Logout ---
    const forgotBtn = document.getElementById('btn-forgot-pass');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            if (!email) { alert("Enter your email in the box first."); return; }
            auth.sendPasswordResetEmail(email).then(() => alert("Reset link sent!"))
                .catch(err => alert("Error: " + err.message));
        });
    }

    document.getElementById('btn-logout-real')?.addEventListener('click', () => {
        auth.signOut().then(() => window.navigateTo('screen-login'));
    });

    // ==========================================
    // 5. Auth State Observer & Profile Loader
    // ==========================================
    auth.onAuthStateChanged((user) => {
        if (user && (user.emailVerified || user.email === SUPER_ADMIN_EMAIL)) {
            currentUserId = user.uid;
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) loadUserDataAndRedirect(user, doc.data());
                else window.navigateTo('screen-onboarding');
            });
        } else {
            currentUserId = null; currentUserData = null;
            window.navigateTo('screen-login');
        }
    });

    function loadUserDataAndRedirect(user, data = null) {
        const processData = (userData) => {
            currentUserData = userData;
            // Super Admin Verification
            if (user.email === SUPER_ADMIN_EMAIL) currentUserData.role = "Admin";
            
            // UI Access Control
            const adminMenuBtn = document.getElementById('btn-menu-admin');
            const noticeFormBtn = document.getElementById('btn-show-notice-form');
            if (currentUserData.role === "Admin") {
                if(adminMenuBtn) adminMenuBtn.style.display = 'block';
                if(noticeFormBtn) noticeFormBtn.style.display = 'block';
            } else {
                if(adminMenuBtn) adminMenuBtn.style.display = 'none';
                if(noticeFormBtn) noticeFormBtn.style.display = 'none';
            }

            // Populate Safe Data to Profile UI
            document.getElementById('prof-name').textContent = currentUserData.name;
            document.getElementById('prof-email').textContent = currentUserData.email;
            document.getElementById('prof-phone').textContent = currentUserData.phone;
            document.getElementById('prof-gender').textContent = currentUserData.gender;
            document.getElementById('prof-type').textContent = currentUserData.role;

            document.getElementById('input-prof-dept').value = currentUserData.dept || "";
            document.getElementById('input-prof-session').value = currentUserData.session || "";
            document.getElementById('input-prof-roll').value = currentUserData.roll || "";

            preFillRequestForms();

            if (document.getElementById('screen-login').classList.contains('hidden') === false || 
                document.getElementById('screen-onboarding').classList.contains('hidden') === false) {
                window.navigateTo('screen-dashboard');
            }
            
            // Start real-time listeners
            loadNotices();
            startFeedAndNotificationListeners();
            setupFilterListeners();
        };

        if (data) processData(data);
        else db.collection('users').doc(user.uid).get().then(doc => processData(doc.data()));
    }

    document.getElementById('btn-save-profile')?.addEventListener('click', () => {
        const dept = document.getElementById('input-prof-dept').value;
        const session = document.getElementById('input-prof-session').value;
        const roll = document.getElementById('input-prof-roll').value;
        const ysDropdown = document.getElementById('prof-ys-dropdown').value;
        
        db.collection('users').doc(currentUserId).update({
            dept: escapeHTML(dept), session: escapeHTML(session), roll: escapeHTML(roll), year_semester: escapeHTML(ysDropdown)
        }).then(() => {
            alert("Profile updated successfully!");
            loadUserDataAndRedirect(auth.currentUser);
        }).catch(err => alert("Error saving profile: " + err.message));
    });

    function preFillRequestForms() {
        if(!currentUserData) return;
        document.getElementById('req-scr-name').value = currentUserData.name;
        document.getElementById('req-scr-phone').value = currentUserData.phone;
        document.getElementById('req-scr-dept').value = currentUserData.dept || "";
        document.getElementById('req-scr-session').value = currentUserData.session || "";
        
        document.getElementById('req-rec-name').value = currentUserData.name;
        document.getElementById('req-rec-dept').value = currentUserData.dept || "";
        
        document.getElementById('req-gen-name').value = currentUserData.name;
        document.getElementById('req-gen-gender').value = currentUserData.gender;
        document.getElementById('req-gen-phone').value = currentUserData.phone;
        document.getElementById('req-gen-dept').value = currentUserData.dept || "";
        document.getElementById('req-gen-session').value = currentUserData.session || "";
    }

    // ==========================================
    // 6. Request Submissions Engine
    // ==========================================
    function submitRequest(collectionData) {
        if (!confirmAction("Are you sure you want to send this request?")) return;
        
        collectionData.requesterId = currentUserId;
        collectionData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        collectionData.status = "Pending";
        collectionData.acceptors = [];
        
        db.collection('requests').add(collectionData).then(() => {
            alert("Request sent successfully! Everyone will be notified.");
            window.navigateTo('screen-your-requests');
            loadYourRequests();
        }).catch(err => alert("Error: " + err.message));
    }

    document.getElementById('form-scribe')?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitRequest({
            type: "Scribe",
            name: escapeHTML(document.getElementById('req-scr-name').value),
            phone: escapeHTML(document.getElementById('req-scr-phone').value),
            dept: escapeHTML(document.getElementById('req-scr-dept').value),
            session: escapeHTML(document.getElementById('req-scr-session').value),
            examType: document.querySelector('input[name="req_scr_exam"]:checked').value,
            yearSem: escapeHTML(document.getElementById('req-scr-ys-dropdown').value),
            date: `${document.getElementById('req-scr-day').value} ${document.getElementById('req-scr-month').value} ${document.getElementById('req-scr-year').textContent}`,
            time: `${document.getElementById('req-scr-hour').value}:${document.getElementById('req-scr-minute').value} ${document.getElementById('req-scr-ampm').value}`,
            duration: escapeHTML(document.getElementById('req-scr-duration').value)
        });
    });

    document.getElementById('form-recording')?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitRequest({
            type: "Recording",
            name: escapeHTML(document.getElementById('req-rec-name').value),
            dept: escapeHTML(document.getElementById('req-rec-dept').value),
            material: document.querySelector('input[name="req_rec_mat"]:checked').value,
            pages: escapeHTML(document.getElementById('req-rec-pages').value)
        });
    });

    document.getElementById('form-general')?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitRequest({
            type: "General",
            name: escapeHTML(document.getElementById('req-gen-name').value),
            gender: escapeHTML(document.getElementById('req-gen-gender').value),
            phone: escapeHTML(document.getElementById('req-gen-phone').value),
            dept: escapeHTML(document.getElementById('req-gen-dept').value),
            session: escapeHTML(document.getElementById('req-gen-session').value),
            desc: escapeHTML(document.getElementById('req-gen-desc').value),
            date: `${document.getElementById('req-gen-day').value} ${document.getElementById('req-gen-month').value} ${document.getElementById('req-gen-year').textContent}`,
            time: `${document.getElementById('req-gen-hour').value}:${document.getElementById('req-gen-minute').value} ${document.getElementById('req-gen-ampm').value}`
        });
    });

    // ==========================================
    // 7. Feed & Notifications (Real-time & Filtered)
    // ==========================================
    function setupFilterListeners() {
        document.querySelectorAll('input[name="notif_filter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentNotifFilter = e.target.value;
                renderCombinedFeed();
            });
        });
        document.querySelectorAll('input[name="feed_filter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentFeedFilter = e.target.value;
                renderCombinedFeed();
            });
        });
    }

    function startFeedAndNotificationListeners() {
        // Snapshot 1: Requests (14 Days)
        db.collection('requests')
          .where('timestamp', '>=', get14DaysAgoTimestamp())
          .orderBy('timestamp', 'desc')
          .onSnapshot(snapshot => {
              localRequests = snapshot.docs.map(doc => ({ id: doc.id, docType: 'request', ...doc.data() }));
              renderCombinedFeed();
          });

        // Snapshot 2: Approvals specific to current user (14 Days)
        db.collection('approvals')
          .where('requesterId', '==', currentUserId)
          .where('timestamp', '>=', get14DaysAgoTimestamp())
          .orderBy('timestamp', 'desc')
          .onSnapshot(snapshot => {
              localApprovals = snapshot.docs.map(doc => ({ id: doc.id, docType: 'approval', ...doc.data() }));
              renderCombinedFeed();
          });
    }

    function renderCombinedFeed() {
        const feedList = document.getElementById('feed-list');
        const notifList = document.getElementById('notification-list');
        if(!feedList || !notifList) return;

        feedList.innerHTML = ''; 
        notifList.innerHTML = '';

        // Combine and Sort by timestamp
        let allItems = [...localRequests, ...localApprovals];
        allItems.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        allItems.forEach(data => {
            // Apply Logic for Notifications
            let showInNotif = false;
            if (currentNotifFilter === 'all') showInNotif = true;
            else if (currentNotifFilter === 'approval' && data.docType === 'approval') showInNotif = true;
            else if (currentNotifFilter === data.type?.toLowerCase() && data.docType === 'request') showInNotif = true;

            // Apply Logic for Feed (Feed only shows requests)
            let showInFeed = false;
            if (data.docType === 'request') {
                if (currentFeedFilter === 'all') showInFeed = true;
                else if (currentFeedFilter === data.type?.toLowerCase()) showInFeed = true;
            }

            // Create Safe HTML Card
            const card = document.createElement('div');
            card.className = 'card item-card';
            
            if (data.docType === 'request') {
                card.innerHTML = `
                    <h4>[${escapeHTML(data.type)} Request] - ${escapeHTML(data.name)}</h4>
                    <p><strong>Dept:</strong> ${escapeHTML(data.dept)}</p>
                    ${data.date ? `<p><strong>Date & Time:</strong> ${escapeHTML(data.date)} | ${escapeHTML(data.time)}</p>` : ''}
                    ${data.desc ? `<p><strong>Details:</strong> ${escapeHTML(data.desc)}</p>` : ''}
                    <div class="action-btns" style="margin-top:10px;">
                        ${data.requesterId !== currentUserId ? `<button class="btn-success btn-sm accept-btn" data-id="${data.id}">Accept</button>` : `<span style="color:gray;">Your Request</span>`}
                        <button class="btn-secondary btn-sm msg-btn">Message</button>
                        <button class="btn-primary btn-sm call-btn" data-phone="${escapeHTML(data.phone || '')}">Call</button>
                    </div>
                `;
            } else if (data.docType === 'approval') {
                card.innerHTML = `
                    <h4 style="color:green;">[Approval] Your request was accepted!</h4>
                    <p><strong>Accepted By:</strong> ${escapeHTML(data.acceptorName)}</p>
                    <p><strong>Phone:</strong> ${escapeHTML(data.acceptorPhone)}</p>
                `;
            }

            if (showInNotif) notifList.appendChild(card.cloneNode(true));
            if (showInFeed && data.docType === 'request') feedList.appendChild(card.cloneNode(true));
        });

        attachActionListeners();
    }

    function attachActionListeners() {
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reqId = e.target.getAttribute('data-id');
                if(!confirmAction("Accept this request?")) return;
                
                db.collection('requests').doc(reqId).update({
                    acceptors: firebase.firestore.FieldValue.arrayUnion({
                        id: currentUserId,
                        name: currentUserData.name,
                        phone: currentUserData.phone,
                        time: new Date().toLocaleString()
                    }),
                    status: "Accepted"
                }).then(() => {
                    // Create Real-Time Approval Notification
                    db.collection('requests').doc(reqId).get().then(doc => {
                        db.collection('approvals').add({
                            requesterId: doc.data().requesterId,
                            requestId: reqId,
                            acceptorName: currentUserData.name,
                            acceptorPhone: currentUserData.phone,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                    alert("Request Accepted!");
                });
            });
        });

        document.querySelectorAll('.call-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const phone = e.target.getAttribute('data-phone');
                if(phone) {
                    if(confirmAction("Call via Phone Number?")) window.location.href = `tel:${phone}`;
                } else alert("Phone number not provided.");
            });
        });

        document.querySelectorAll('.msg-btn').forEach(btn => {
            btn.addEventListener('click', () => alert("In-app messaging feature coming soon!"));
        });
    }

    // ==========================================
    // 8. Your Current Requests Management
    // ==========================================
    document.querySelector('[data-target="screen-your-requests"]')?.addEventListener('click', loadYourRequests);

    function loadYourRequests() {
        db.collection('requests')
          .where('requesterId', '==', currentUserId)
          .where('timestamp', '>=', get14DaysAgoTimestamp())
          .orderBy('timestamp', 'desc')
          .onSnapshot(snapshot => {
            const list = document.getElementById('your-request-list');
            if(!list) return;
            list.innerHTML = '';
            
            if(snapshot.empty) { list.innerHTML = "<p>You have no active requests.</p>"; return; }

            snapshot.forEach(doc => {
                const data = doc.data();
                const card = document.createElement('div');
                card.className = 'card';
                
                let acceptorsHTML = '';
                if(data.acceptors && data.acceptors.length > 0) {
                    acceptorsHTML = `<hr><h5>Accepted By:</h5><ul>`;
                    data.acceptors.forEach(acc => {
                        acceptorsHTML += `<li>${escapeHTML(acc.name)} (${escapeHTML(acc.phone)}) <br><small>${escapeHTML(acc.time)}</small></li>`;
                    });
                    acceptorsHTML += `</ul>`;
                }

                card.innerHTML = `
                    <h4>${escapeHTML(data.type)} Request</h4>
                    <p>Status: <strong>${escapeHTML(data.status)}</strong></p>
                    ${acceptorsHTML}
                    <div style="margin-top:10px;">
                        <button class="btn-danger btn-sm" onclick="deleteOwnRequest('${doc.id}')">Delete Request</button>
                    </div>
                `;
                list.appendChild(card);
            });
        });
    }

    window.deleteOwnRequest = function(docId) {
        if(confirmAction("Are you sure you want to permanently delete this request?")) {
            db.collection('requests').doc(docId).delete().then(() => alert("Deleted!"));
        }
    };

    // ==========================================
    // 9. Notice Board Engine
    // ==========================================
    const noticeForm = document.getElementById('form-create-notice');
    if (noticeForm) {
        noticeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(!confirmAction("Publish this notice?")) return;

            db.collection('notices').add({
                title: escapeHTML(document.getElementById('notice-title').value),
                body: escapeHTML(document.getElementById('notice-body').value),
                publisherName: escapeHTML(currentUserData.name),
                publisherEmail: currentUserData.email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert("Notice Published!");
                noticeForm.reset();
                document.getElementById('notice-form-container').classList.add('hidden');
            });
        });
    }

    function loadNotices() {
        db.collection('notices').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            const list = document.getElementById('notice-list');
            if(!list) return;
            list.innerHTML = '';
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const dateStr = data.timestamp ? data.timestamp.toDate().toLocaleString() : "Just now";
                const div = document.createElement('div');
                div.className = 'card clickable-card';
                div.innerHTML = `
                    <h3>${escapeHTML(data.title)}</h3>
                    <p class="meta-text">${escapeHTML(dateStr)} | By: ${escapeHTML(data.publisherName)}</p>
                `;
                div.addEventListener('click', () => openNoticeDetails(doc.id, data, dateStr));
                list.appendChild(div);
            });
        });
    }

    function openNoticeDetails(id, data, dateStr) {
        window.navigateTo('screen-notice-details');
        document.getElementById('detail-notice-title').textContent = data.title; // Secure by default
        document.getElementById('detail-notice-meta').textContent = `${dateStr} | By: ${data.publisherName}`;
        document.getElementById('detail-notice-body').textContent = data.body;

        const controls = document.getElementById('admin-notice-controls');
        if (currentUserData.role === "Admin") {
            controls.style.display = "block";
            document.getElementById('btn-delete-notice').onclick = () => {
                if(confirmAction("Delete this notice permanently?")) {
                    db.collection('notices').doc(id).delete().then(() => {
                        alert("Notice deleted.");
                        window.navigateTo('screen-notices');
                    });
                }
            };
        } else {
            controls.style.display = "none";
        }
    }

    // ==========================================
    // 10. Admin Manager Console
    // ==========================================
    document.querySelector('[data-target="screen-admin"]')?.addEventListener('click', loadAdminConsole);
    document.querySelector('[data-target="screen-admin-view-users"]')?.addEventListener('click', loadAllUsers);
    document.querySelector('[data-target="screen-admin-add"]')?.addEventListener('click', loadPotentialAdmins);

    function loadAdminConsole() {
        if (currentUserData.role !== "Admin") return;
        db.collection('users').where('role', '==', 'Admin').get().then(snapshot => {
            const list = document.getElementById('admin-user-list');
            list.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<strong>${escapeHTML(data.name)}</strong> (${escapeHTML(data.email)}) 
                ${data.email !== SUPER_ADMIN_EMAIL ? `<button class="btn-danger btn-sm right" onclick="removeAdmin('${doc.id}')">Remove</button>` : `<span class="right" style="color:red;">[Super Admin]</span>`}`;
                list.appendChild(div);
            });
        });
    }

    window.removeAdmin = function(uid) {
        if(confirmAction("Remove this user from Admins?")) {
            db.collection('users').doc(uid).update({ role: "General Member" }).then(() => {
                alert("User demoted to General Member."); loadAdminConsole();
            });
        }
    };

    function loadAllUsers() {
        // Simple listener for filters
        const filterRadios = document.querySelectorAll('input[name="admin_user_filter"]');
        let selectedFilter = Array.from(filterRadios).find(r => r.checked)?.value || "All";

        db.collection('users').orderBy('name').get().then(snapshot => {
            const list = document.getElementById('full-user-list');
            list.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                if (selectedFilter !== "All" && data.role !== selectedFilter) return;

                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<strong>${escapeHTML(data.name)}</strong> | ${escapeHTML(data.role)} <br><small>${escapeHTML(data.email)}</small>
                <button class="btn-danger btn-sm right" onclick="deleteUserAccount('${doc.id}')">Delete Acc</button>`;
                list.appendChild(div);
            });
        });

        // Re-run when filter changes
        filterRadios.forEach(radio => radio.onchange = loadAllUsers);
    }

    window.deleteUserAccount = function(uid) {
        if(confirmAction("WARNING: Delete this user's profile from database?")) {
            db.collection('users').doc(uid).delete().then(() => loadAllUsers());
        }
    };

    function loadPotentialAdmins() {
        const filterRadios = document.querySelectorAll('input[name="admin_add_filter"]');
        let selectedFilter = Array.from(filterRadios).find(r => r.checked)?.value || "All";

        db.collection('users').where('role', '!=', 'Admin').get().then(snapshot => {
            const list = document.getElementById('potential-admin-list');
            list.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                if (selectedFilter !== "All" && data.role !== selectedFilter) return;

                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<strong>${escapeHTML(data.name)}</strong> (${escapeHTML(data.role)}) 
                <button class="btn-success btn-sm right" onclick="makeAdmin('${doc.id}')">Make Admin</button>`;
                list.appendChild(div);
            });
        });

        filterRadios.forEach(radio => radio.onchange = loadPotentialAdmins);
    }

    window.makeAdmin = function(uid) {
        if(confirmAction("Promote this user to Admin?")) {
            db.collection('users').doc(uid).update({ role: "Admin" }).then(() => {
                alert("User promoted to Admin!"); loadPotentialAdmins();
            });
        }
    };

});