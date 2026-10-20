// VARIABEL GLOBAL UNTUK MODE
let currentMode = 'invoice'; // Default

// ELEMEN DOM
const welcomeModal = document.getElementById('welcome-modal');
const panelTitle = document.getElementById('panel-title');
const invoiceInputs = document.getElementById('invoice-only-inputs');
const kwitansiInputs = document.getElementById('kwitansi-only-inputs');
const invoicePreviewContainer = document.getElementById('invoice-preview-container');
const kwitansiPreviewContainer = document.getElementById('kwitansi-preview-container');

// FUNGSI POPUP AWAL
function selectDocumentMode(mode) {
    welcomeModal.style.display = 'none';
    setMode(mode);
}

// FUNGSI GANTI MODE
function toggleDocumentMode() {
    currentMode = (currentMode === 'invoice') ? 'kwitansi' : 'invoice';
    setMode(currentMode);
}

// LOGIKA TAMPILAN
function setMode(mode) {
    currentMode = mode;
    document.body.className = `mode-${mode}`;
    
    if (mode === 'invoice') {
        panelTitle.textContent = "Invoice Builder";
        kwitansiInputs.style.display = 'none';
        invoicePreviewContainer.style.display = 'block';
        kwitansiPreviewContainer.style.display = 'none';
    } else {
        panelTitle.textContent = "Kwitansi Builder";
        kwitansiInputs.style.display = 'block';
        invoicePreviewContainer.style.display = 'none';
        kwitansiPreviewContainer.style.display = 'block';
    }
    updateAllViews();
    updateDocTitle();
}

// MOBILE MENU
const btnToggle = document.getElementById('mobile-menu-btn');
const adminPanel = document.getElementById('admin-panel');
const overlay = document.getElementById('mobile-overlay');

function toggleMenu() {
    adminPanel.classList.toggle('open');
    overlay.classList.toggle('open');
}
btnToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// TANGGAL & INVOICE NO
const today = new Date();
const dateInput = document.getElementById('input-date');
const previewDate = document.getElementById('preview-date');
const kwtPreviewDate = document.getElementById('kwt-preview-date');

const invNoInput = document.getElementById('input-inv-no');
const previewInvNo = document.getElementById('preview-inv-no');
const kwtPreviewNo = document.getElementById('kwt-preview-no');

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
dateInput.value = today.toISOString().split('T')[0];

function generateAutoInvoiceNumber(dateObj) {
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yearStr = dateObj.getFullYear();
    const randomPuluhan = Math.floor(10 + Math.random() * 90); 
    return `We-${yearStr}${monthStr}${dayStr}-${randomPuluhan}`;
}

invNoInput.value = generateAutoInvoiceNumber(today);

function updateInvoiceNo() {
    const val = invNoInput.value.trim() || invNoInput.placeholder;
    previewInvNo.textContent = `No- ${val}`;
    kwtPreviewNo.textContent = val;
    updateDocTitle();
}
invNoInput.addEventListener('input', updateInvoiceNo);

// CUSTOMER NAME & ALAMAT
const titleEl = document.getElementById('input-cust-title');
const nameEl = document.getElementById('input-cust-name');
const addressEl = document.getElementById('input-cust-address');

const previewCust = document.getElementById('preview-cust-name');
const previewAddress = document.getElementById('preview-cust-address');
const kwtPreviewCust = document.getElementById('kwt-preview-cust');
const kwtPreviewAddress = document.getElementById('kwt-preview-address');

function updateCustInfo() {
    const rawName = nameEl.value.trim();
    const fullName = rawName ? `${titleEl.value} ${rawName}`.trim() : "";
    const address = addressEl.value.trim();
    
    // Update Name
    previewCust.textContent = fullName;
    kwtPreviewCust.textContent = fullName;
    
    // Update Address
    previewAddress.innerHTML = address ? address.replace(/\n/g, '<br>') : "";
    kwtPreviewAddress.innerHTML = address ? address.replace(/\n/g, '<br>') : "";
    
    updateDocTitle();
}
titleEl.addEventListener('change', updateCustInfo);
nameEl.addEventListener('input', updateCustInfo);
addressEl.addEventListener('input', updateCustInfo);

// FORMAT NAMA FILE OTOMATIS SAAT SAVE/PRINT
function updateDocTitle() {
    const inv = (invNoInput.value.trim() || invNoInput.placeholder).replace(/\s+|\//g, '_');
    const name = nameEl.value.trim().replace(/\s+/g, '_') || "TanpaNama";
    const docType = currentMode === 'kwitansi' ? 'Kwitansi' : 'Invoice';
    document.title = `${docType}_${name}_${inv}`;
}

// ISSUER
const issuerInput = document.getElementById('input-issuer');
const previewIssuer = document.getElementById('preview-issuer');
const kwtPreviewIssuer = document.getElementById('kwt-preview-issuer');

issuerInput.value = "Fabella";
function updateIssuer() {
    const val = issuerInput.value.trim();
    previewIssuer.textContent = val ? `( ${val} )` : "";
    kwtPreviewIssuer.textContent = val ? `( ${val} )` : "";
}
issuerInput.addEventListener('input', updateIssuer);
updateIssuer();

// AUTO UPDATE NOMOR SAAT TANGGAL KALENDER DIUBAH
function updateDateStr() {
    if(!dateInput.value) return;
    const d = new Date(dateInput.value);
    const dateText = `Jakarta, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    previewDate.textContent = dateText;
    kwtPreviewDate.textContent = dateText;

    invNoInput.value = generateAutoInvoiceNumber(d);
    updateInvoiceNo();
}
dateInput.addEventListener('change', updateDateStr);

// FORMAT RUPIAH / DOLAR
function formatInputRibuan(input) {
    let val = input.value.replace(/[^0-9,]/g, ''); 
    if(val) {
        let parts = val.split(',');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = parts.join(',');
    } else {
        input.value = '';
    }
    updateAllViews();
}

// FORMAT MATA UANG 1 BARIS (NON-BREAKING SPACE)
function formatCurrency(angka, currency) {
    if(angka === 0) return '';
    if(currency === 'USD') return 'USD\u00A0' + angka.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return 'Rp\u00A0' + angka.toLocaleString('id-ID') + ',-';
}

function angkaKeTerbilang(angka) {
    if (angka === 0) return ""; 
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

// ELEMENTS INVOICE & KWITANSI
const itemsContainer = document.getElementById('dynamic-items-list');
const btnAddItem = document.getElementById('btn-add-item');
const inputKwtDesc = document.getElementById('input-kwt-desc');

// UPDATE VIEW UNTUK INVOICE DAN KWITANSI
function updateAllViews() {
    const currency = document.getElementById('input-currency').value;
    const rows = document.querySelectorAll('.item-input-row');
    
    let htmlInv = '';
    let htmlKwt = '';
    let grandTotal = 0;

    rows.forEach(row => {
        const desc = row.querySelector('.input-item-desc').value;
        const amtStr = row.querySelector('.input-item-amount').value;
        const amtClean = amtStr.replace(/\./g, '').replace(',', '.');
        const amt = parseFloat(amtClean) || 0;

        grandTotal += amt;

        if(desc || amt > 0) {
            htmlInv += `
            <div class="preview-item-row">
                <div class="preview-desc-cell">${desc.replace(/\n/g, '<br>')}</div>
                <div class="preview-amount-cell">${formatCurrency(amt, currency)}</div>
            </div>`;
            
            htmlKwt += `
            <div class="kwt-item-row">
                <div class="kwt-item-desc">▪ ${desc.replace(/\n/g, '<br>')}</div>
                <div class="kwt-item-amt">${formatCurrency(amt, currency)}</div>
            </div>`;
        }
    });

    // INVOICE
    document.getElementById('preview-items-container').innerHTML = htmlInv;
    document.getElementById('preview-total').textContent = grandTotal > 0 ? formatCurrency(grandTotal, currency) : "";
    document.getElementById('preview-terbilang').textContent = generateTerbilangText(grandTotal, currency).toUpperCase();
    
    // KWITANSI
    document.getElementById('kwt-preview-desc').innerHTML = inputKwtDesc.value.replace(/\n/g, '<br>');
    document.getElementById('kwt-items-container').innerHTML = htmlKwt; 
    document.getElementById('kwt-preview-amount').textContent = grandTotal > 0 ? formatCurrency(grandTotal, currency) : "";
    document.getElementById('kwt-preview-terbilang').textContent = generateTerbilangText(grandTotal, currency).toUpperCase();
}

function generateTerbilangText(total, currency) {
    if (total <= 0) return "";
    let intPart = Math.floor(total);
    let decPart = Math.round((total - intPart) * 100);
    
    let textInt = intPart === 0 ? "Nol" : angkaKeTerbilang(intPart).replace(/\s+/g, ' ').trim();
    
    if (currency === 'USD') {
        let res = textInt + " Dolar Amerika";
        if (decPart > 0) res += " " + angkaKeTerbilang(decPart).replace(/\s+/g, ' ').trim() + " Sen";
        return res;
    } else {
        return textInt + " Rupiah";
    }
}

// FUNGSI TOGGLE MATERAI
function toggleMaterai() {
    const useMaterai = document.getElementById('input-use-materai').checked;
    const materaiImgs = document.querySelectorAll('.meterai-img');
    materaiImgs.forEach(img => {
        // Menggunakan 'none' agar posisi TTD rata tengah jika tidak ada materai
        img.style.display = useMaterai ? 'block' : 'none';
    });
}

// EVENT LISTENERS
itemsContainer.addEventListener('input', function(e) {
    if (e.target.classList.contains('input-item-desc')) updateAllViews();
});
inputKwtDesc.addEventListener('input', updateAllViews);

btnAddItem.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'item-input-row';
    newRow.innerHTML = `
        <div class="item-inputs">
            <textarea class="form-control input-item-desc" placeholder="Ketik deskripsi transaksi di sini...&#10;(Tekan Enter untuk baris baru)"></textarea>
            <input type="text" class="form-control input-item-amount" placeholder="Nominal (Rp/USD)" oninput="formatInputRibuan(this)">
        </div>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); updateAllViews();">X</button>
    `;
    itemsContainer.appendChild(newRow);
    updateAllViews();
});

// ISI DUMMY DATA OTOMATIS
document.getElementById('btn-auto-fill').addEventListener('click', () => {
    if(!confirm("Isi otomatis data contoh?")) return;
    document.getElementById('input-cust-title').value = "Mr.";
    nameEl.value = "Henky";
    addressEl.value = "Jl. Kemenangan Raya No. 44\nJakarta Barat 11110";
    
    itemsContainer.innerHTML = "";
    const dummyItems = [
        {desc: "Pelunasan Tour 10D Holydoor Assisi", amt: "32.900.000"},
        {desc: "Biaya Tambahan Single Supplement", amt: "13.000.000"}
    ];
    
    dummyItems.forEach(item => {
        const newRow = document.createElement('div');
        newRow.className = 'item-input-row';
        newRow.innerHTML = `
            <div class="item-inputs">
                <textarea class="form-control input-item-desc">${item.desc}</textarea>
                <input type="text" class="form-control input-item-amount" value="${item.amt}" oninput="formatInputRibuan(this)">
            </div>
            <button type="button" class="btn-delete" onclick="this.parentElement.remove(); updateAllViews();">X</button>
        `;
        itemsContainer.appendChild(newRow);
    });

    inputKwtDesc.value = "Pelunasan biaya perjalanan 10 Hari Holydoor Assisi keberangkatan 5 November 2026.";
    
    updateCustInfo();
    updateAllViews();
});

// INIT
updateInvoiceNo();
updateCustInfo();
updateDateStr();
updateAllViews();
toggleMaterai(); // Set materai default state