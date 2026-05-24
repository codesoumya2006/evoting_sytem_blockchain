const API_BASE = CONFIG.BACKEND_URL;
const CC_KEYS = { adminSession: 'cc_admin_session' };

let modalMode = 'add';
let deleteTarget = null;
let selectedFile = null;
let editingId = null;

let votingState = { isOpen: false, expiryTime: 0, durationMinutes: 0 };

// ── FETCH HELPERS ──────────────────────────────────────────

async function getData(url) {
  try {
    console.log("📥 GET:", API_BASE + url);
    const res = await fetch(API_BASE + url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      mode: 'cors'
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API Error ${res.status}: ${txt || res.statusText}`);
    }
    const text = await res.text();
    if (text && text.trim().length > 0) {
      try { return JSON.parse(text); } catch (e) { return { message: text }; }
    }
    return { message: "Success" };
  } catch (err) { console.error("❌ Fetch error:", err); throw err; }
}

async function postData(url, data) {
  try {
    console.log("📤 POST:", API_BASE + url, data);
    const res = await fetch(API_BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      mode: 'cors',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API Error ${res.status}: ${txt || res.statusText}`);
    }
    const text = await res.text();
    if (text && text.trim().length > 0) {
      try { return JSON.parse(text); } catch (e) { return { message: text }; }
    }
    return { message: "Success" };
  } catch (err) { console.error("❌ Fetch error:", err); throw err; }
}

async function putData(url, data) {
  try {
    console.log("📤 PUT:", API_BASE + url, data);
    const res = await fetch(API_BASE + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      mode: 'cors',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API Error ${res.status}: ${txt || res.statusText}`);
    }
    const text = await res.text();
    if (text && text.trim().length > 0) {
      try { return JSON.parse(text); } catch (e) { return { message: text }; }
    }
    return { message: "Success" };
  } catch (err) { console.error("❌ Fetch error:", err); throw err; }
}

async function deleteData(url) {
  try {
    console.log("📤 DELETE:", API_BASE + url);
    const res = await fetch(API_BASE + url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      mode: 'cors'
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API Error ${res.status}: ${txt || res.statusText}`);
    }
    const text = await res.text();
    if (text && text.trim().length > 0) {
      try { return JSON.parse(text); } catch (e) { return { message: text }; }
    }
    return { success: true, message: "Deleted successfully" };
  } catch (err) { console.error("❌ Fetch error:", err); throw err; }
}

// ── AUTH & LOGOUT ──────────────────────────────────────────
function doLogout() { localStorage.removeItem(CC_KEYS.adminSession); location.reload(); }
function isLoggedIn() { return !!localStorage.getItem(CC_KEYS.adminSession); }
function getAdminEmail() {
  const s = localStorage.getItem(CC_KEYS.adminSession);
  if (!s) return null;
  try { return JSON.parse(s).email; } catch { return null; }
}

// ── LOGIN ─────────────────────────────────────────────
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.onsubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;
    if (email === "admin@civicchain.com" && pass === "password") {
      localStorage.setItem(CC_KEYS.adminSession, JSON.stringify({ email }));
      showDashboard(email);
      return;
    }
    showAlert("Invalid credentials", "error");
  };
  if (isLoggedIn()) showDashboard(getAdminEmail());
}

// ── SHOW DASHBOARD ─────────────────────────────────────────
async function showDashboard(email) {
  try {
    await fetchVotingStatus();
    if (isVotingOpen()) {
      document.getElementById('loginSection')?.classList.remove('active');
      document.getElementById('adminLockOverlay').style.display = 'flex';
      return;
    }
    document.getElementById('loginSection')?.classList.remove('active');
    document.getElementById('dashboard')?.classList.add('active');
    document.getElementById('topbar')?.classList.add('show');
    const el = document.getElementById('adminEmail');
    if (el) el.textContent = `${email}`;
    await renderAll();
    updateVotingUI();
  } catch (err) {
    console.error(err);
    // Still show dashboard even if voting status fetch fails
    document.getElementById('loginSection')?.classList.remove('active');
    document.getElementById('dashboard')?.classList.add('active');
    document.getElementById('topbar')?.classList.add('show');
    await renderAll();
  }
}

// ── VOTING STATUS ──────────────────────────────────────────
async function fetchVotingStatus() {
  try {
    const data = await getData('/voting/status');
    console.log("🗳️ Voting Status:", data);
    if (data && typeof data === 'object') {
      const isOpen = data.status === "OPEN" || data.isOpen === true;
      votingState.isOpen = isOpen;
      votingState.expiryTime = data.expiryMillis || 0;
      votingState.durationMinutes = data.durationMinutes || 0;
    }
    return data;
  } catch (err) {
    console.error("❌ Error fetching voting status:", err);
    votingState.isOpen = false;
    votingState.expiryTime = 0;
    return null;
  }
}

function isVotingOpen() {
  return votingState.isOpen && votingState.expiryTime > Date.now();
}

async function updateVotingUI() {
  const badge = document.getElementById('statusBadge');
  const timerEl = document.getElementById('timerDisplay');
  if (!badge || !timerEl) return;
  try {
    await fetchVotingStatus();
    const open = isVotingOpen();
    if (open) {
      const rem = votingState.expiryTime - Date.now();
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      badge.textContent = '🔓 VOTING OPEN';
      badge.className = 'status-badge open';
      timerEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (rem <= 0) await doLockVoting();
    } else {
      badge.textContent = '🔒 VOTING LOCKED';
      badge.className = 'status-badge locked';
      timerEl.textContent = '--:--:--';
    }
  } catch (err) { console.error("❌ Error updating voting UI:", err); }
}

setInterval(updateVotingUI, 1000);

async function doOpenVoting() {
  const minInput = document.getElementById('timerMinutes');
  const min = parseInt(minInput?.value);
  if (!min || min <= 0 || min > 720) { showAlert("Invalid time (1-720 minutes)", "error"); return; }
  try {
    showAlert("Opening voting...", "success");
    await postData('/voting/open', { durationMinutes: min });
    await fetchVotingStatus();
    updateVotingUI();
    showAlert("✅ Voting opened. Admin session ending...", "success");
    setTimeout(() => {
      localStorage.removeItem(CC_KEYS.adminSession);
      sessionStorage.clear();
      window.location.href = "index.html";
    }, 1500);
  } catch (err) {
    console.error("❌ Error opening voting:", err);
    showAlert("Failed to open voting: " + err.message, "error");
  }
}

async function doLockVoting() {
  try {
    showAlert("Locking voting...", "success");
    await postData('/voting/lock', {});
    votingState.isOpen = false;
    votingState.expiryTime = 0;
    await fetchVotingStatus();
    updateVotingUI();
    showAlert("✅ Voting locked", "success");
  } catch (err) {
    console.error("❌ Error locking voting:", err);
    showAlert("Failed to lock voting: " + err.message, "error");
  }
}

async function resetSystem() {
  if (!confirm("⚠️ Reset entire system? This will delete all candidates, voters, votes, and blockchain data.")) return;
  try {
    showAlert("Resetting system...", "success");
    await deleteData('/admin/reset');
    await renderAll();
    await fetchVotingStatus();
    await updateVotingUI();
    showAlert("✅ System reset complete", "success");
  } catch (err) { showAlert("Reset failed: " + err.message, "error"); }
}

async function resetVotes() {
  if (!confirm("⚠️ Reset all votes? This will delete all blockchain blocks, set candidate vote counts to 0, and mark all voters as not voted.")) return;
  try {
    showAlert("Resetting votes...", "success");
    await deleteData('/admin/reset-votes');
    await renderAll();
    showAlert("✅ Votes reset complete", "success");
  } catch (err) { showAlert("Reset failed: " + err.message, "error"); }
}

async function resetCandidates() {
  if (!confirm("⚠️ Clear all candidates?")) return;
  try {
    await deleteData('/candidates/all');
    await renderCandidates();
    showAlert("✅ Candidates cleared", "success");
  } catch (err) { showAlert("Failed: " + err.message, "error"); }
}

async function resetVoters() {
  if (!confirm("⚠️ Clear all voters?")) return;
  try {
    await deleteData('/voters/all');
    await renderVoters();
    showAlert("✅ Voters cleared", "success");
  } catch (err) { showAlert("Failed: " + err.message, "error"); }
}

// ── TAB NAVIGATION ─────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const tab = document.getElementById(`tab-${btn.dataset.tab}`);
      if (tab) tab.classList.add('active');
      btn.classList.add('active');
    });
  });
}

// ── MODAL FUNCTIONS ────────────────────────────────────────
function openModal(type) {
  modalMode = 'add';
  editingId = null;
  document.getElementById('f_editId').value = '';
  if (type === 'candidate') {
    document.getElementById('candidateFields').style.display = 'block';
    document.getElementById('voterFields').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Add Candidate';
    clearCandidateFields();
  } else if (type === 'voter') {
    document.getElementById('candidateFields').style.display = 'none';
    document.getElementById('voterFields').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Add Voter';
    clearVoterFields();
  }
  document.getElementById('crudModal').classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('crudModal');
  if (modal) modal.classList.remove('show');
  clearCandidateFields();
  clearVoterFields();
  modalMode = 'add';
  editingId = null;
}

function clearCandidateFields() {
  document.getElementById('f_cand_candid').value = '';
  document.getElementById('f_cand_name').value = '';
  document.getElementById('f_cand_party').value = '';
  document.getElementById('f_cand_emoji').value = '';
  document.getElementById('f_cand_color').value = '';
  document.getElementById('f_cand_tag').value = '';
}

function clearVoterFields() {
  document.getElementById('f_v_id').value = '';
  document.getElementById('f_v_name').value = '';
  document.getElementById('f_v_dob').value = '';
  document.getElementById('f_v_phone').value = '';
  document.getElementById('f_v_emoji').value = '';
}

async function saveItem() {
  if (document.getElementById('candidateFields').style.display !== 'none') {
    await saveCandidate();
  } else {
    await saveVoter();
  }
  closeModal();
}

// ── CANDIDATE OPERATIONS ───────────────────────────────────
async function saveCandidate() {
  const cId = document.getElementById('f_cand_candid').value.trim();
  const name = document.getElementById('f_cand_name').value.trim();
  const party = document.getElementById('f_cand_party').value.trim();
  const emoji = document.getElementById('f_cand_emoji').value.trim() || '🎓';
  const color = document.getElementById('f_cand_color').value.trim() || '#3b82f6';
  const tag = document.getElementById('f_cand_tag').value.trim() || '';

  if (!cId || !name) { showAlert("Candidate ID and Name are required", "error"); return; }

  const payload = { candidateId: cId, name, party, emoji, color, tag };

  try {
    if (editingId) {
      await putData(`/candidates/${editingId}`, payload);
      showAlert("✅ Candidate updated", "success");
    } else {
      await postData("/candidates", payload);
      showAlert("✅ Candidate added", "success");
    }
    await renderCandidates();
  } catch (err) { showAlert("Save failed: " + err.message, "error"); }
}

async function deleteCandidate(id) {
  try {
    await deleteData(`/candidates/${id}`);
    showAlert("✅ Candidate deleted", "success");
    await renderCandidates();
  } catch (err) { showAlert("Failed: " + err.message, "error"); }
}

// ── VOTER OPERATIONS ───────────────────────────────────────
async function saveVoter() {
  const voterId = document.getElementById('f_v_id').value.trim();
  const name = document.getElementById('f_v_name').value.trim();
  const dob = document.getElementById('f_v_dob').value.trim();
  const phone = document.getElementById('f_v_phone').value.trim();

  if (!voterId || !name) { showAlert("Voter ID and Name are required", "error"); return; }

  const voterData = { voterId, name, dob, mobileNo: phone, hasVoted: false };

  try {
    if (editingId) {
      await putData(`/voters/${editingId}`, voterData);
      showAlert("✅ Voter updated", "success");
    } else {
      await postData("/voters", voterData);
      showAlert("✅ Voter added", "success");
    }
    await renderVoters();
  } catch (err) { showAlert("Save failed: " + err.message, "error"); }
}

async function deleteVoter(id) {
  try {
    await deleteData(`/voters/${id}`);
    showAlert("✅ Voter deleted", "success");
    await renderVoters();
  } catch (err) { showAlert("Failed: " + err.message, "error"); }
}

// ── DELETE MODAL ───────────────────────────────────────────
function openDeleteModal(type, id) {
  deleteTarget = { type, id };
  document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
  deleteTarget = null;
}

async function confirmDelete() {
  if (!deleteTarget) return;
  const { type, id } = deleteTarget;
  try {
    if (type === 'candidate') await deleteCandidate(id);
    else if (type === 'voter') await deleteVoter(id);
  } catch (err) { showAlert("Failed: " + err.message, "error"); }
  closeDeleteModal();
}

// ── RENDER ────────────────────────────────────────────────
async function renderAll() {
  await renderCandidates();
  await renderVoters();
  await renderVotes();
}

async function renderCandidates() {
  const el = document.getElementById("candidatesBody");
  if (!el) return;
  try {
    const items = await getData("/candidates");
    if (!items || !Array.isArray(items) || items.length === 0) {
      el.innerHTML = '<div class="empty-row">No candidates added yet</div>';
      return;
    }
    el.innerHTML = items.map(c => `
      <div class="trow cand-row">
        <span>${c.name}</span>
        <span>${c.party || '—'}</span>
        <span style="font-size:1.2rem">${c.emoji || '🎓'}</span>
        <span><div style="width:24px;height:24px;background:${c.color || '#3b82f6'};border-radius:4px;border:1px solid var(--border)"></div></span>
        <div style="display:flex;gap:6px">
          <button class="action-btn edit-btn" onclick="editCandidate(${c.id})">✏️</button>
          <button class="action-btn del-btn" onclick="openDeleteModal('candidate', ${c.id})">🗑️</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = '<div class="empty-row">Error loading candidates</div>';
  }
}

async function renderVoters() {
  const el = document.getElementById("votersBody");
  if (!el) return;
  try {
    const items = await getData("/voters");
    if (!items || !Array.isArray(items) || items.length === 0) {
      el.innerHTML = '<div class="empty-row">No voters registered yet</div>';
      return;
    }
    el.innerHTML = items.map(v => `
      <div class="trow voter-row">
        <span>${v.voterId}</span>
        <span>${v.name}</span>
        <span>${v.dob || '—'}</span>
        <span>${v.mobileNo || '—'}</span>
        <div style="display:flex;gap:6px">
          <button class="action-btn edit-btn" onclick="editVoter(${v.id})">✏️</button>
          <button class="action-btn del-btn" onclick="openDeleteModal('voter', ${v.id})">🗑️</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = '<div class="empty-row">Error loading voters</div>';
  }
}

async function renderVotes() {
  const el = document.getElementById("votesBody");
  if (!el) return;
  try {
    const items = await getData("/admin/votes");
    if (!items || !Array.isArray(items) || items.length === 0) {
      el.innerHTML = '<div class="empty-row">No votes recorded yet</div>';
      return;
    }
    el.innerHTML = items.map((v, idx) => `
      <div class="trow vote-row">
        <span>${v.voterId}</span>
        <span>${v.candidateName}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:.75rem">${new Date(v.timestamp).toLocaleString()}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--muted)">${v.txHash?.substring(0, 10) || '—'}...</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--accent)">#${v.block || Math.floor(idx / 10) + 1}</span>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = '<div class="empty-row">Error loading votes</div>';
  }
}

// ── EDIT FUNCTIONS ─────────────────────────────────────────
async function editCandidate(id) {
  try {
    const candidate = await getData(`/candidates/${id}`);
    if (!candidate) { showAlert("Candidate not found", "error"); return; }
    editingId = id;
    modalMode = 'edit';
    document.getElementById('f_editId').value = id;
    document.getElementById('f_cand_candid').value = candidate.candidateId || '';
    document.getElementById('f_cand_name').value = candidate.name || '';
    document.getElementById('f_cand_party').value = candidate.party || '';
    document.getElementById('f_cand_emoji').value = candidate.emoji || '🎓';
    document.getElementById('f_cand_color').value = candidate.color || '#3b82f6';
    document.getElementById('f_cand_tag').value = candidate.tag || '';
    document.getElementById('candidateFields').style.display = 'block';
    document.getElementById('voterFields').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Edit Candidate';
    document.getElementById('crudModal').classList.add('show');
  } catch (err) { showAlert("Failed to load candidate: " + err.message, "error"); }
}

async function editVoter(id) {
  try {
    if (!id) { showAlert("Invalid voter ID", "error"); return; }
    const voter = await getData(`/voters/${id}`);
    if (!voter) { showAlert("Voter not found", "error"); return; }
    editingId = id;
    modalMode = "edit";
    document.getElementById("f_editId").value = id;
    document.getElementById("f_v_id").value = voter.voterId || "";
    document.getElementById("f_v_name").value = voter.name || "";
    document.getElementById("f_v_dob").value = voter.dob || "";
    document.getElementById("f_v_phone").value = voter.mobileNo || "";
    document.getElementById("f_v_emoji").value = voter.emoji || "👤";
    document.getElementById("candidateFields").style.display = "none";
    document.getElementById("voterFields").style.display = "block";
    document.getElementById("modalTitle").textContent = "Edit Voter";
    document.getElementById("crudModal").classList.add("show");
  } catch (err) { showAlert("Failed to load voter: " + err.message, "error"); }
}

// ── FILE UPLOAD & IMPORT ───────────────────────────────────
function previewFile(input) {
  selectedFile = input.files[0];
  const preview = document.getElementById('uploadPreview');
  if (selectedFile) preview.textContent = `📄 ${selectedFile.name} selected`;
}

function downloadSample() {
  const csv = 'VoterID,Name,DOB,PhoneNumber\nVOT001,John Doe,1990-05-12,9876543210\nVOT002,Jane Smith,1985-08-23,9123456789';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sample_voters.csv'; a.click();
  URL.revokeObjectURL(url);
}

async function importVoters() {
  if (!selectedFile) { showAlert("Please select a file first", "error"); return; }
  try {
    const text = await selectedFile.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) { showAlert("CSV must have header and data", "error"); return; }
    let importCount = 0, errorCount = 0;
    showAlert(`Importing ${lines.length - 1} voters...`, "success");
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2 || !parts[0]) continue;
      const [voterId, name, dob, phone] = parts;
      try {
        await postData("/voters", { voterId, name, dob: dob || '', mobileNo: phone || '', hasVoted: false });
        importCount++;
      } catch (err) { errorCount++; }
    }
    await renderVoters();
    showAlert(`✅ Imported ${importCount} voters` + (errorCount > 0 ? ` (${errorCount} failed)` : ''), "success");
    document.getElementById('voterFile').value = '';
    selectedFile = null;
  } catch (err) { showAlert("Failed to import: " + err.message, "error"); }
}

// ── TOAST ────────────────────────────────────
let lastAlertTime = 0;
function showAlert(message, type = 'success') {
  const now = Date.now();
  if (now - lastAlertTime < 500) return;
  lastAlertTime = now;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 's' : 'e'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── CURSOR ────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  if (!cursor || !ring) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  function loop() {
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(loop);
  }
  loop();
}

// ── INIT ───────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Admin dashboard initializing...");
  initLogin();
  initCursor();
  initTabs();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeDeleteModal(); }
});

document.addEventListener('click', (e) => {
  if (e.target === document.getElementById('crudModal')) closeModal();
  if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
});
