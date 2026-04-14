// Data paths
const MITRA_DATA = 'data/tabel_mitra_rows.json';
const PRODUK_DATA = 'data/tabel_product_rows.json';

// Global data
let mitraData = [];
let produkData = [];

// Load all data on init
async function loadData() {
    try {
        const [mitraRes, produkRes] = await Promise.all([
            fetch(MITRA_DATA),
            fetch(PRODUK_DATA)
        ]);
        mitraData = await mitraRes.json();
        produkData = await produkRes.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update stats on home
async function loadStats() {
    await loadData();
    document.getElementById('totalMitra').textContent = mitraData.length;
    document.getElementById('totalProduk').textContent = produkData.length;
    document.getElementById('totalTransaksi').textContent = '0'; // Placeholder
}

// Load mitra chart on home (product categories per mitra)
async function loadMitraChart() {
    await loadData();
    
    // Count categories for the single mitra
    const categoryCount = {};
    produkData.forEach(produk => {
        const cat = produk.kategori || 'Unknown';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const ctx = document.getElementById('mitraChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                data: Object.values(categoryCount),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Distribusi Kategori Produk (kantin Bu Rasyid)'
                }
            }
        }
    });
}

// Load mitra table
async function loadMitraList() {
    await loadData();
    const container = document.getElementById('mitraList');
    if (mitraData.length === 0) {
        container.innerHTML = '<p>Tidak ada data mitra.</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Nama Mitra</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Alamat</th>
                    <th>Kategori</th>
                    <th>Sekolah</th>
                </tr>
            </thead>
            <tbody>
    `;
    mitraData.forEach(mitra => {
        html += `
            <tr>
                <td>${mitra.nama_mitra}</td>
                <td>${mitra.owner_mitra}</td>
                <td>${mitra.email}</td>
                <td>${mitra.alamat}</td>
                <td>${mitra.kategori}</td>
                <td>${mitra.sekolah}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Load produk grid
async function loadProdukGrid() {
    await loadData();
    const container = document.getElementById('produkGrid');
    if (produkData.length === 0) {
        container.innerHTML = '<p>Tidak ada produk.</p>';
        return;
    }

    let html = '';
    produkData.forEach(produk => {
        html += `
            <div class="produk-card">
                <img src="${produk.foto_url}" alt="${produk.nama_produk}" class="produk-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                <div class="produk-info">
                    <div class="produk-name">${produk.nama_produk}</div>
                    <div class="produk-price">Rp ${parseInt(produk.harga).toLocaleString('id-ID')}</div>
                    <div class="produk-stock">Stok: ${produk.stok}</div>
                    <div class="produk-mitra">Mitra: kantin Bu Rasyid</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// === AUTH FUNCTIONS ===
// Check if user logged in (localStorage)
function checkAuth() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Register new user
async function registerUser(e) {
    e.preventDefault();
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!nama || !email || !password) {
        alert('Semua field wajib diisi!');
        return;
    }

    // Simple check duplicate (from stored users)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Email sudah terdaftar!');
        return;
    }

    const user = { nama, email, password }; // In prod, hash password!
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));

    alert('Registrasi berhasil! Redirect ke akun...');
    window.location.href = 'akun.html';
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Init navbar dynamic
function initNav() {
    const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    if (!navbar) return;

    const ul = navbar.querySelector('.nav-menu') || navbar.appendChild(document.createElement('ul'));
    ul.className = 'nav-menu';
    ul.innerHTML = `
        <li><a href="index.html" class="nav-link ${window.location.pathname.includes('index') ? 'active' : ''}">Home</a></li>
        <li><a href="mitra.html" class="nav-link">Mitra</a></li>
        <li><a href="produk.html" class="nav-link">Produk</a></li>
        <li id="authNav"><a href="#" class="nav-link"></a></li>
    `;

    const authLink = document.getElementById('authNav');
    if (checkAuth()) {
        const user = getCurrentUser();
        authLink.innerHTML = `<a href="akun.html" class="nav-link">Akun (${user.nama})</a>`;
        authLink.querySelector('a').addEventListener('click', (e) => {
            // Add logout option later
        });
    } else {
        authLink.innerHTML = `<a href="register.html" class="nav-link">Register/Login</a>`;
    }
}

// Load profile on akun.html
function loadProfile() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'register.html';
        return;
    }

    document.getElementById('profile').innerHTML = `
        <h2>Selamat datang, ${user.nama}!</h2>
        <p>Email: ${user.email}</p>
        <button onclick="logout()" class="btn-primary">Logout</button>
    `;
}

// Nav active state (simple for multi-page)
document.addEventListener('DOMContentLoaded', function() {
    initNav();
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', function() {
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

