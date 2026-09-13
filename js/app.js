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

// KETENTUAN: Default awalan We-
const defaultInvoice = `We-${yearStr}${monthStr}${dayStr}-${randomPuluhan}`;
invNoInput.value = defaultInvoice; 

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

// KETENTUAN: Default Issued By "Fabella"
issuerInput.value = "Fabella";
previewIssuer.textContent = "( Fabella )";

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

// MODIFIKASI: Memungkinkan input koma (,) untuk sen desimal USD
function formatInputRibuan(input) {
    let val = input.value.replace(/[^0-9,]/g, ''); 
    if(val) {
        let parts = val.split(',');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = parts.join(',');
    } else {
        input.value = '';
    }
    updateInvoiceItems();
}

// FORMAT MATA UANG USD & IDR
function formatCurrency(angka, currency) {
    if(angka === 0) return '';
    if(currency === 'USD') {
        return 'USD ' + angka.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    return 'Rp ' + angka.toLocaleString('id-ID') + ',-';
}

// LOGIKA TERBILANG (Anti-Nol di Akhir)
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

const itemsContainer = document.getElementById('dynamic-items-list');
const btnAddItem = document.getElementById('btn-add-item');
const previewItemsContainer = document.getElementById('preview-items-container');
const previewTotal = document.getElementById('preview-total');
const previewTerbilang = document.getElementById('preview-terbilang');

function updateInvoiceItems() {
    const rows = document.querySelectorAll('.item-input-row');
    const currencySelect = document.getElementById('input-currency');
    const currency = currencySelect ? currencySelect.value : 'IDR';
    
    let html = '';
    let grandTotal = 0;

    rows.forEach(row => {
        const desc = row.querySelector('.input-item-desc').value;
        const amtStr = row.querySelector('.input-item-amount').value;
        
        const amtClean = amtStr.replace(/\./g, '').replace(',', '.');
        const amt = parseFloat(amtClean) || 0;

        grandTotal += amt;

        if(desc || amt > 0) {
            html += `
            <div class="preview-item-row">
                <div class="preview-desc-cell">${desc.replace(/\n/g, '<br>')}</div>
                <div class="preview-amount-cell">${formatCurrency(amt, currency)}</div>
            </div>`;
        }
    });

    previewItemsContainer.innerHTML = html;
    previewTotal.textContent = grandTotal > 0 ? formatCurrency(grandTotal, currency) : "";
    
    // Logika ejaan Terbilang Dolar
    let terbilangStr = "";
    if (grandTotal > 0) {
        let intPart = Math.floor(grandTotal);
        let decPart = Math.round((grandTotal - intPart) * 100);
        
        let textInt = intPart === 0 ? "Nol" : angkaKeTerbilang(intPart).replace(/\s+/g, ' ').trim();
        
        if (currency === 'USD') {
            terbilangStr = textInt + " Dolar Amerika";
            if (decPart > 0) {
                terbilangStr += " " + angkaKeTerbilang(decPart).replace(/\s+/g, ' ').trim() + " Sen";
            }
        } else {
            terbilangStr = textInt + " Rupiah";
        }
    }
    previewTerbilang.textContent = terbilangStr.toUpperCase();
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
            <input type="text" class="form-control input-item-amount" placeholder="Nominal (Rp/USD)" oninput="formatInputRibuan(this)">
        </div>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); updateInvoiceItems();">X</button>
    `;
    itemsContainer.appendChild(newRow);
    updateInvoiceItems();
});

// FITUR ISI OTOMATIS
document.getElementById('btn-auto-fill').addEventListener('click', () => {
    if(!confirm("Isi otomatis data contoh?")) return;
    document.getElementById('input-cust-title').value = "Mr.";
    nameEl.value = "Henky";
    
    itemsContainer.innerHTML = "";
    const dummyItems = [
        {desc: "Adult Twin / Triple Share\n(7 Adult)", amt: "32.900.000"},
        {desc: "Single Supplement\n(1 Pax)", amt: "13.000.000"}
    ];
    
    dummyItems.forEach(item => {
        const newRow = document.createElement('div');
        newRow.className = 'item-input-row';
        newRow.innerHTML = `
            <div class="item-inputs">
                <textarea class="form-control input-item-desc">${item.desc}</textarea>
                <input type="text" class="form-control input-item-amount" value="${item.amt}" oninput="formatInputRibuan(this)">
            </div>
            <button type="button" class="btn-delete" onclick="this.parentElement.remove(); updateInvoiceItems();">X</button>
        `;
        itemsContainer.appendChild(newRow);
    });
    
    updateCustName();
    updateInvoiceItems();
});

updateInvoiceNo();
updateCustName();
updateDateStr();
updateInvoiceItems();