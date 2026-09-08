const btnToggle = document.getElementById('mobile-menu-btn');
const adminPanel = document.getElementById('admin-panel');
const overlay = document.getElementById('mobile-overlay');

function toggleMenu() {
    adminPanel.classList.toggle('open');
    overlay.classList.toggle('open');
}
btnToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

const today = new Date();
const dateInput = document.getElementById('input-date');
const previewDate = document.getElementById('preview-date');
const invNoInput = document.getElementById('input-inv-no');
const previewInvNo = document.getElementById('preview-inv-no');

const dayStr = String(today.getDate()).padStart(2, '0');
const monthStr = String(today.getMonth() + 1).padStart(2, '0');
const yearStr = today.getFullYear();
const randomPuluhan = Math.floor(10 + Math.random() * 90); 

const defaultInvoice = `INV/WH/${yearStr}${monthStr}${dayStr}/0${randomPuluhan}`;
invNoInput.placeholder = defaultInvoice;

function updateInvoiceNo() {
    const val = invNoInput.value.trim() || invNoInput.placeholder;
    previewInvNo.textContent = `No- ${val}`;
    updateDocTitle();
}
invNoInput.addEventListener('input', updateInvoiceNo);

const titleEl = document.getElementById('input-cust-title');
const nameEl = document.getElementById('input-cust-name');
const previewCust = document.getElementById('preview-cust-name');

function updateCustName() {
    const rawName = nameEl.value.trim();
    if(rawName) {
        previewCust.textContent = `${titleEl.value} ${rawName}`.trim();
    } else {
        previewCust.textContent = "";
    }
    updateDocTitle();
}
titleEl.addEventListener('change', updateCustName);
nameEl.addEventListener('input', updateCustName);

function updateDocTitle() {
    const inv = (invNoInput.value.trim() || invNoInput.placeholder).replace(/\s+|\//g, '_');
    const name = nameEl.value.trim().replace(/\s+/g, '_') || "TanpaNama";
    document.title = `Invoice_${inv}_${name}`;
}

const issuerInput = document.getElementById('input-issuer');
const previewIssuer = document.getElementById('preview-issuer');
issuerInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    previewIssuer.textContent = val ? `( ${val} )` : "";
});

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
dateInput.value = today.toISOString().split('T')[0];

function updateDateStr() {
    if(!dateInput.value) return;
    const d = new Date(dateInput.value);
    previewDate.textContent = `Jakarta, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
dateInput.addEventListener('change', updateDateStr);

function formatInputRibuan(input) {
    let val = input.value.replace(/[^,\d]/g, ''); 
    if(val) {
        input.value = parseInt(val, 10).toLocaleString('id-ID');
    } else {
        input.value = '';
    }
    updateInvoiceItems();
}

function formatRupiah(angka) {
    if(angka === 0) return '';
    return 'Rp ' + angka.toLocaleString('id-ID') + ',-';
}

function angkaKeTerbilang(angka) {
    const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let hasil = "";
    if (angka < 12) hasil = bilangan[angka];
    else if (angka < 20) hasil = bilangan[angka - 10] + " Belas";
    else if (angka < 100) hasil = bilangan[Math.floor(angka / 10)] + " Puluh " + bilangan[angka % 10];
    else if (angka < 200) hasil = "Seratus " + angkaKeTerbilang(angka - 100);
    else if (angka < 1000) hasil = bilangan[Math.floor(angka / 100)] + " Ratus " + angkaKeTerbilang(angka % 100);
    else if (angka < 2000) hasil = "Seribu " + angkaKeTerbilang(angka - 1000);
    else if (angka < 1000000) hasil = angkaKeTerbilang(Math.floor(angka / 1000)) + " Ribu " + angkaKeTerbilang(angka % 1000);
    else if (angka < 1000000000) hasil = angkaKeTerbilang(Math.floor(angka / 1000000)) + " Juta " + angkaKeTerbilang(angka % 1000000);
    else if (angka < 1000000000000) hasil = angkaKeTerbilang(Math.floor(angka / 1000000000)) + " Miliar " + angkaKeTerbilang(angka % 1000000000);
    return hasil.trim();
}

const itemsContainer = document.getElementById('dynamic-items-list');
const btnAddItem = document.getElementById('btn-add-item');
const previewItemsContainer = document.getElementById('preview-items-container');
const previewTotal = document.getElementById('preview-total');
const previewTerbilang = document.getElementById('preview-terbilang');

function updateInvoiceItems() {
    const rows = document.querySelectorAll('.item-input-row');
    let html = '';
    let grandTotal = 0;

    rows.forEach(row => {
        const desc = row.querySelector('.input-item-desc').value;
        const amtStr = row.querySelector('.input-item-amount').value;
        const amtClean = amtStr.replace(/\./g, '');
        const amt = parseInt(amtClean) || 0;

        grandTotal += amt;

        if(desc || amt > 0) {
            html += `
            <div class="preview-item-row">
                <div class="preview-desc-cell">${desc.replace(/\n/g, '<br>')}</div>
                <div class="preview-amount-cell">${formatRupiah(amt)}</div>
            </div>`;
        }
    });

    previewItemsContainer.innerHTML = html;
    previewTotal.textContent = grandTotal > 0 ? formatRupiah(grandTotal) : "";
    previewTerbilang.textContent = grandTotal > 0 ? angkaKeTerbilang(grandTotal) + " Rupiah" : "";
}

itemsContainer.addEventListener('input', function(e) {
    if (e.target.classList.contains('input-item-desc')) {
        updateInvoiceItems();
    }
});

btnAddItem.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'item-input-row';
    newRow.innerHTML = `
        <div class="item-inputs">
            <textarea class="form-control input-item-desc" placeholder="Ketik deskripsi transaksi di sini...&#10;(Tekan Enter untuk baris baru)"></textarea>
            <input type="text" class="form-control input-item-amount" placeholder="Nominal (Rp)" oninput="formatInputRibuan(this)">
        </div>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); updateInvoiceItems();">X</button>
    `;
    itemsContainer.appendChild(newRow);
    updateInvoiceItems();
});

updateInvoiceNo();
updateCustName();
updateDateStr();
updateInvoiceItems();
previewIssuer.textContent = "";