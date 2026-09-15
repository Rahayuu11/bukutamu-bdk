document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. DATA STANDAR AWAL & LOCALSTORAGE
    // ==========================================
    const defaultData = [
        { 
            id: 1, 
            tanggal: '07/09/2026 09:30', 
            nama: 'Putri Nabillah', 
            hp: '0812-3456-7890', 
            jabatan: 'Siswa / Mahasiswa', 
            instansi: 'Unesa', 
            pejabat: 'ppp', 
            keperluan: 'Magang & Riset', 
            status: 'Active' 
        },
        { 
            id: 2, 
            tanggal: '07/09/2026 09:30', 
            nama: 'Fathera Ardila', 
            hp: '0852-556-3789', 
            jabatan: 'Pranata Komputer', 
            instansi: 'Kanwil Surabaya', 
            pejabat: 'Kepala BDK', 
            keperluan: 'Koordinasi Diklat', 
            status: 'Active' 
        },
        { 
            id: 3, 
            tanggal: '07/09/2026 10:15', 
            nama: 'Nama Barrkat', 
            hp: '0852-676-3790', 
            jabatan: 'Staf Administrasi', 
            instansi: 'BKK ASRA', 
            pejabat: 'Kasubag TU', 
            keperluan: 'Kementasan Keagamaan', 
            status: 'Pending' 
        }
    ];

    let dataTamu = JSON.parse(localStorage.getItem('bdk_tamu_list')) || defaultData;

    // Helper Pembaca Properti Luwes
    function formatItem(item) {
        return {
            id: item.id || Date.now(),
            tanggal: item.tanggal || item.waktu || item.datetime || '07/09/2026',
            nama: item.nama || '-',
            jabatan: item.jabatan || item.posisi || 'Tamu',
            instansi: item.instansi || '-',
            hp: item.hp || item.noHp || '-',
            pejabat: item.pejabat || item.pegawai || '-',
            keperluan: item.keperluan || '-',
            status: item.status || 'Active'
        };
    }

    function simpanData() {
        localStorage.setItem('bdk_tamu_list', JSON.stringify(dataTamu));
        renderTable(dataTamu, 'dashboardTableBody');
        renderTable(dataTamu, 'searchResultsBody');
        updateStats();
    }

    // ==========================================
    // 2. AUTH GUARD (PENGAMAN ADMIN)
    // ==========================================
    const isAdminPage = window.location.pathname.includes('admin.html');

    if (isAdminPage) {
        fetch('http://localhost/buku-tamu-bdk/backend/check-session.php', { credentials: 'include' })
            .then(response => response.json())
            .then(result => {
                if (!result.success) {
                    window.location.href = 'login.html';
                    return;
                }

                const adminNameEl = document.getElementById('welcomeUser');
                if (adminNameEl) {
                    adminNameEl.textContent = `Admin ${result.admin.nama || result.admin.username}`;
                }
            })
            .catch(() => {
                window.location.href = 'login.html';
            });
    }

    // ==========================================
    // 3. RENDER TABEL UNIVERSAL
    // ==========================================
    function renderTable(dataList, tbodyId) {
        const tableBody = document.getElementById(tbodyId);
        if (!tableBody) return;

        tableBody.innerHTML = '';
        if (!dataList || dataList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-gray-400">Data tidak ditemukan.</td></tr>`;
            return;
        }

        dataList.forEach((rawItem, index) => {
            const item = formatItem(rawItem);
            const badgeColor = item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600';
            const row = `
                <tr class="hover:bg-gray-50">
                    <td class="py-3 px-3 font-medium">${index + 1}</td>
                    <td class="py-3 px-3 whitespace-nowrap">${item.tanggal}</td>
                    <td class="py-3 px-3 font-semibold text-gray-800">${item.nama}</td>
                    <td class="py-3 px-3">${item.jabatan}</td>
                    <td class="py-3 px-3">${item.instansi}</td>
                    <td class="py-3 px-3">${item.hp}</td>
                    <td class="py-3 px-3">${item.pejabat}</td>
                    <td class="py-3 px-3">${item.keperluan}</td>
                    <td class="py-3 px-3"><span class="${badgeColor} px-2 py-0.5 rounded-full font-bold text-xs">${item.status}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // ==========================================
    // 4. FILTER PENCARIAN REALTIME
    // ==========================================
    const searchGuestInput = document.getElementById('searchGuestInput');
    if (searchGuestInput) {
        searchGuestInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = dataTamu.filter(rawItem => {
                const item = formatItem(rawItem);
                return (
                    item.nama.toLowerCase().includes(query) ||
                    item.instansi.toLowerCase().includes(query) ||
                    item.hp.toLowerCase().includes(query) ||
                    item.pejabat.toLowerCase().includes(query) ||
                    item.jabatan.toLowerCase().includes(query) ||
                    item.keperluan.toLowerCase().includes(query)
                );
            });
            renderTable(filtered, 'searchResultsBody');
        });
    }

    // ==========================================
    // 5. UPDATE STATISTIK DASHBOARD ADMIN
    // ==========================================
    function updateStats() {
        const totalEl = document.getElementById('statTotalTamu');
        const activeEl = document.getElementById('statActiveTamu');
        
        if (totalEl) totalEl.textContent = dataTamu.length;
        if (activeEl) {
            const activeCount = dataTamu.filter(t => t.status === 'Active').length;
            activeEl.textContent = activeCount;
        }
    }

    // ==========================================
    // 6. FORM CHECK-IN ADMIN
    // ==========================================
    const checkinForm = document.getElementById('checkinForm');
    if (checkinForm) {
        checkinForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const newGuest = {
                id: Date.now(),
                tanggal: formattedDate,
                nama: document.getElementById('inputNama').value.trim(),
                hp: document.getElementById('inputHp').value.trim(),
                jabatan: document.getElementById('inputJabatan').value.trim(),
                instansi: document.getElementById('inputInstansi').value.trim(),
                pejabat: document.getElementById('inputPejabat').value.trim(),
                keperluan: document.getElementById('inputKeperluan').value.trim(),
                status: 'Active'
            };

            dataTamu.unshift(newGuest);
            simpanData();
            checkinForm.reset();

            alert('Check-in Berhasil!');
            const dashBtn = document.querySelector('[data-target="dashboard"]');
            if (dashBtn) dashBtn.click();
        });
    }

    // ==========================================
    // 7. EKSPOR EXCEL (SHEETJS)
    // ==========================================
    const btnExport = document.getElementById('btnExportExcel');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            if (typeof XLSX === 'undefined') return alert('Library XLSX belum dimuat.');
            if (dataTamu.length === 0) return alert('Tidak ada data.');

            const excelRows = dataTamu.map((raw, idx) => {
                const item = formatItem(raw);
                return {
                    'No': idx + 1,
                    'Tanggal / Waktu': item.tanggal,
                    'Nama Lengkap': item.nama,
                    'Jabatan / Posisi': item.jabatan,
                    'Asal Instansi': item.instansi,
                    'No. HP / WA': item.hp,
                    'Pegawai Dikunjungi': item.pejabat,
                    'Keperluan': item.keperluan,
                    'Status': item.status
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Tamu');
            XLSX.writeFile(workbook, `Rekap_Tamu_BDK_Surabaya.xlsx`);
        });
    }

    // ==========================================
    // 8. NAVIGASI MENU SIDEBAR ADMIN
    // ==========================================
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.page-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            sections.forEach(sec => sec.classList.add('hidden'));

            const activeSection = document.getElementById(`section-${target}`);
            if (activeSection) activeSection.classList.remove('hidden');

            navButtons.forEach(b => {
                b.classList.remove('bg-emerald-800', 'text-amber-300', 'font-semibold', 'shadow-sm');
                b.classList.add('text-emerald-100', 'hover:bg-emerald-900');
            });

            btn.classList.remove('text-emerald-100', 'hover:bg-emerald-900');
            btn.classList.add('bg-emerald-800', 'text-amber-300', 'font-semibold', 'shadow-sm');
        });
    });

    // ==========================================
    // 9. JAM REALTIME & LOGOUT
    // ==========================================
    const datetimeEl = document.getElementById('currentDatetime');
    if (datetimeEl) {
        setInterval(() => {
            datetimeEl.textContent = `Waktu sistem: ${new Date().toLocaleString('id-ID')}`;
        }, 1000);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('http://localhost/buku-tamu-bdk/backend/logout.php', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = 'login.html';
        });
    }

    // Inisialisasi awal
    renderTable(dataTamu, 'dashboardTableBody');
    renderTable(dataTamu, 'searchResultsBody');
    updateStats();
});