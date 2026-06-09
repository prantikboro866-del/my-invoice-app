// State Object to manage current invoice and list of saved invoices
let state = {
    currentUser: null,
    userProfile: null,
    currentInvoice: {
        logo: '',
        bizName: '',
        bizEmail: '',
        bizPhone: '',
        bizAddress: '',
        invNumber: '',
        invCurrency: '$',
        invDate: '',
        invDue: '',
        clientCompany: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        items: [],
        discount: 0,
        shipping: 0,
        notes: ''
    },
    savedInvoices: []
};

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Set default dates: Today and Due in 14 days
    setDefaultDates();

    // Setup input listeners for real-time preview sync
    setupInputBindings();

    // Setup Navigation Tabs
    setupTabs();

    // Setup Logo upload handlers
    setupLogoUploader();

    // Setup Items Management (Add, Delete, Clear)
    setupItemsHandlers();

    // Setup Save, Reset, Demo actions
    setupActionButtons();

    // Setup Firebase Authentication & Config UI
    setupFirebaseAuth();

    // Auto-load demo data on first-ever load to show off the styling
    if (!localStorage.getItem('invoicr_visited')) {
        loadDemoData();
        localStorage.setItem('invoicr_visited', 'true');
    } else {
        // Render baseline preview
        updateTotals();
    }

    // Initialize Lucide icons
    lucide.createIcons();
}

function setDefaultDates() {
    const today = new Date();
    const invDateInput = document.getElementById('inv-date');
    const invDueInput = document.getElementById('inv-due');
    
    // Format to YYYY-MM-DD
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    
    const todayStr = `${yyyy}-${mm}-${dd}`;
    invDateInput.value = todayStr;
    state.currentInvoice.invDate = todayStr;
    document.getElementById('preview-inv-date').textContent = todayStr;

    // Due date (14 days later)
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);
    
    const dy = dueDate.getFullYear();
    let dm = dueDate.getMonth() + 1;
    let ddDue = dueDate.getDate();
    
    if (dm < 10) dm = '0' + dm;
    if (ddDue < 10) ddDue = '0' + ddDue;
    
    const dueStr = `${dy}-${dm}-${ddDue}`;
    invDueInput.value = dueStr;
    state.currentInvoice.invDue = dueStr;
    document.getElementById('preview-inv-due').textContent = dueStr;
}

// ==========================================================================
// Tab Navigation Logic
// ==========================================================================
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Toggle buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle panes
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetTab) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

// ==========================================================================
// Input Data Binding (Form-to-Preview Real-time Sync)
// ==========================================================================
function setupInputBindings() {
    const bindings = [
        { inputId: 'biz-name', previewId: 'preview-biz-name', stateField: 'bizName', defaultVal: 'Your Company Name' },
        { inputId: 'biz-email', previewId: 'preview-biz-email', stateField: 'bizEmail', defaultVal: 'email@company.com' },
        { inputId: 'biz-phone', previewId: 'preview-biz-phone', stateField: 'bizPhone', defaultVal: '+1 (555) 000-1234' },
        { inputId: 'biz-address', previewId: 'preview-biz-address', stateField: 'bizAddress', defaultVal: '123 Street Address, City, State' },
        { inputId: 'inv-number', previewId: 'preview-inv-number', stateField: 'invNumber', defaultVal: 'INV-00000' },
        { inputId: 'inv-date', previewId: 'preview-inv-date', stateField: 'invDate', defaultVal: 'YYYY-MM-DD' },
        { inputId: 'inv-due', previewId: 'preview-inv-due', stateField: 'invDue', defaultVal: 'YYYY-MM-DD' },
        { inputId: 'client-company', previewId: 'preview-client-company', stateField: 'clientCompany', defaultVal: 'Client Company Name' },
        { inputId: 'client-name', previewId: 'preview-client-name', stateField: 'clientName', defaultVal: 'Contact Name' },
        { inputId: 'client-email', previewId: 'preview-client-email', stateField: 'clientEmail', defaultVal: 'client@email.com' },
        { inputId: 'client-phone', previewId: 'preview-client-phone', stateField: 'clientPhone', defaultVal: '+1 (555) 000-0000' },
        { inputId: 'client-address', previewId: 'preview-client-address', stateField: 'clientAddress', defaultVal: 'Billing Address, City, State' },
        { inputId: 'inv-notes', previewId: 'preview-inv-notes', stateField: 'notes', defaultVal: 'Payment is due upon receipt unless specified. Thank you!' }
    ];

    bindings.forEach(b => {
        const inputEl = document.getElementById(b.inputId);
        const previewEl = document.getElementById(b.previewId);

        if (inputEl && previewEl) {
            inputEl.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                state.currentInvoice[b.stateField] = val;
                
                if (val === '') {
                    previewEl.textContent = b.defaultVal;
                    previewEl.classList.add('fallback-placeholder');
                } else {
                    previewEl.textContent = val;
                    previewEl.classList.remove('fallback-placeholder');
                }
            });
        }
    });

    // Special input: Currency selector
    const currencySelect = document.getElementById('inv-currency');
    currencySelect.addEventListener('change', (e) => {
        state.currentInvoice.invCurrency = e.target.value;
        updateTotals();
    });

    // Special input: Discount & Shipping
    ['inv-discount', 'inv-shipping'].forEach(id => {
        const inputEl = document.getElementById(id);
        inputEl.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (isNaN(val) || val < 0) val = 0;
            
            if (id === 'inv-discount') {
                state.currentInvoice.discount = val;
            } else {
                state.currentInvoice.shipping = val;
            }
            updateTotals();
        });
    });
}

// ==========================================================================
// Logo Image Processing (Base64 conversion)
// ==========================================================================
function setupLogoUploader() {
    const logoInput = document.getElementById('logo-input');
    const logoPreview = document.getElementById('logo-preview');
    const logoPreviewWrapper = document.querySelector('.logo-preview-wrapper');
    const uploadLabel = document.querySelector('.logo-upload-label');
    const removeLogoBtn = document.getElementById('btn-remove-logo');
    
    const invPreviewLogo = document.getElementById('inv-preview-logo');
    const invPreviewLogoContainer = document.getElementById('inv-preview-logo-container');

    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target.result;
                
                // Save in state
                state.currentInvoice.logo = base64Data;
                
                // Show in Form Panel
                logoPreview.src = base64Data;
                logoPreviewWrapper.style.display = 'inline-block';
                uploadLabel.style.display = 'none';

                // Show in Invoice Preview
                invPreviewLogo.src = base64Data;
                invPreviewLogoContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeLogoBtn.addEventListener('click', () => {
        logoInput.value = '';
        state.currentInvoice.logo = '';
        
        // Hide in Form Panel
        logoPreview.src = '';
        logoPreviewWrapper.style.display = 'none';
        uploadLabel.style.display = 'flex';

        // Hide in Invoice Preview
        invPreviewLogo.src = '';
        invPreviewLogoContainer.style.display = 'none';
    });
}

// ==========================================================================
// Line Items Management (Add, Remove, List Render)
// ==========================================================================
function setupItemsHandlers() {
    const btnAddItem = document.getElementById('btn-add-item');
    const btnClearItems = document.getElementById('btn-clear-items');

    btnAddItem.addEventListener('click', () => {
        const descInput = document.getElementById('item-desc');
        const qtyInput = document.getElementById('item-qty');
        const priceInput = document.getElementById('item-price');
        const taxInput = document.getElementById('item-tax');

        const desc = descInput.value.trim();
        const qty = parseFloat(qtyInput.value);
        const price = parseFloat(priceInput.value);
        const tax = parseFloat(taxInput.value);

        if (desc === '') {
            showToast('Please enter a description for the item.', 'error');
            descInput.focus();
            return;
        }

        if (isNaN(qty) || qty <= 0) {
            showToast('Please enter a valid quantity greater than 0.', 'error');
            qtyInput.focus();
            return;
        }

        if (isNaN(price) || price < 0) {
            showToast('Please enter a valid price.', 'error');
            priceInput.focus();
            return;
        }

        // Add to state
        const newItem = {
            id: Date.now().toString(),
            description: desc,
            quantity: qty,
            price: price,
            tax: isNaN(tax) ? 0 : tax
        };

        state.currentInvoice.items.push(newItem);

        // Reset Item fields
        descInput.value = '';
        qtyInput.value = '1';
        priceInput.value = '0.00';
        taxInput.value = '0';

        // Re-render
        renderItems();
        updateTotals();
        showToast('Item added to invoice.');
    });

    btnClearItems.addEventListener('click', () => {
        if (state.currentInvoice.items.length === 0) return;
        
        if (confirm('Are you sure you want to remove all items?')) {
            state.currentInvoice.items = [];
            renderItems();
            updateTotals();
            showToast('All items removed.');
        }
    });
}

function renderItems() {
    const itemsList = document.getElementById('items-list');
    const placeholder = document.getElementById('items-list-placeholder');
    const previewTableBody = document.getElementById('preview-table-body');
    const currency = state.currentInvoice.invCurrency;

    // 1. Render items list in sidebar editor
    itemsList.innerHTML = '';
    
    if (state.currentInvoice.items.length === 0) {
        placeholder.style.display = 'flex';
        itemsList.style.display = 'none';
    } else {
        placeholder.style.display = 'none';
        itemsList.style.display = 'flex';

        state.currentInvoice.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'items-list-item animate-fadeIn';
            
            const total = item.quantity * item.price;
            const taxText = item.tax > 0 ? ` (+${item.tax}% tax)` : '';
            
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${escapeHTML(item.description)}</div>
                    <div class="item-pricing-sub">
                        ${item.quantity} x ${formatCurrency(item.price, currency)} = ${formatCurrency(total, currency)}${taxText}
                    </div>
                </div>
                <button type="button" class="btn-remove-item" data-id="${item.id}" title="Remove Item">
                    <i data-lucide="trash"></i>
                </button>
            `;
            
            itemsList.appendChild(li);
        });

        // Add Delete Button Listeners in sidebar
        itemsList.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = btn.getAttribute('data-id');
                state.currentInvoice.items = state.currentInvoice.items.filter(item => item.id !== itemId);
                renderItems();
                updateTotals();
                showToast('Item removed.');
            });
        });
    }

    // 2. Render items in real-time A4 Invoice Preview table
    previewTableBody.innerHTML = '';
    
    if (state.currentInvoice.items.length === 0) {
        previewTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table-placeholder">Add line items to populate this table</td>
            </tr>
        `;
    } else {
        state.currentInvoice.items.forEach(item => {
            const tr = document.createElement('tr');
            const subtotal = item.quantity * item.price;
            
            tr.innerHTML = `
                <td>${escapeHTML(item.description)}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.price, currency)}</td>
                <td class="text-right">${item.tax > 0 ? `${item.tax}%` : '0%'}</td>
                <td class="text-right">${formatCurrency(subtotal, currency)}</td>
            `;
            
            previewTableBody.appendChild(tr);
        });
    }

    // Re-trigger icon compilation for newly added nodes
    lucide.createIcons();
}

// ==========================================================================
// Arithmetic Calculations (Subtotals, Taxes, Total)
// ==========================================================================
function updateTotals() {
    const currency = state.currentInvoice.invCurrency;
    
    let subtotalSum = 0;
    let taxSum = 0;

    state.currentInvoice.items.forEach(item => {
        const itemSubtotal = item.quantity * item.price;
        subtotalSum += itemSubtotal;
        
        if (item.tax > 0) {
            taxSum += itemSubtotal * (item.tax / 100);
        }
    });

    const discountVal = state.currentInvoice.discount;
    const shippingVal = state.currentInvoice.shipping;
    const grandTotal = subtotalSum + taxSum - discountVal + shippingVal;

    // Update form extra indicators
    document.getElementById('preview-subtotal').textContent = formatCurrency(subtotalSum, currency);
    document.getElementById('preview-tax-total').textContent = formatCurrency(taxSum, currency);

    // Manage discount display
    const discountRow = document.getElementById('preview-discount-row');
    if (discountVal > 0) {
        document.getElementById('preview-discount').textContent = `-${formatCurrency(discountVal, currency)}`;
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }

    // Manage shipping display
    const shippingRow = document.getElementById('preview-shipping-row');
    if (shippingVal > 0) {
        document.getElementById('preview-shipping').textContent = `+${formatCurrency(shippingVal, currency)}`;
        shippingRow.style.display = 'flex';
    } else {
        shippingRow.style.display = 'none';
    }

    // Grand total update
    const totalString = formatCurrency(grandTotal, currency);
    document.getElementById('preview-grand-total').textContent = totalString;
    document.getElementById('preview-balance-due').textContent = totalString;
}

// ==========================================================================
// Operations Buttons Handlers (Save, Reset, Load Demo, Print, PDF)
// ==========================================================================
function setupActionButtons() {
    // Demo data
    document.getElementById('btn-demo-data').addEventListener('click', loadDemoData);

    // Reset current form
    document.getElementById('btn-reset-form').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear current invoice details? This will not affect saved invoices.')) {
            resetCurrentForm();
            showToast('Current invoice cleared.');
        }
    });

    // Save current invoice
    document.getElementById('btn-save-invoice').addEventListener('click', saveCurrentInvoice);

    // Print invoice action
    document.getElementById('btn-print-invoice').addEventListener('click', () => {
        window.print();
    });

    // Download PDF Action (using html2pdf.js)
    document.getElementById('btn-download-pdf').addEventListener('click', () => {
        const element = document.getElementById('invoice-paper');
        const invNum = state.currentInvoice.invNumber || 'INVOICE';
        
        // Hide outline borders / placeholders during direct capture if needed
        // (Our css already handles this beautifully, but let's configuration options)
        const opt = {
            margin:       [10, 10, 10, 10], // top, left, bottom, right in mm
            filename:     `${invNum}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        showToast('Generating your PDF document...');
        
        html2pdf().from(element).set(opt).save()
            .then(() => {
                showToast('PDF downloaded successfully!');
            })
            .catch(err => {
                console.error(err);
                showToast('Failed to download PDF. Try printing to PDF instead.', 'error');
            });
    });
}

function resetCurrentForm() {
    // Clear State
    state.currentInvoice = {
        logo: '',
        bizName: state.userProfile ? (state.userProfile.bizName || '') : '',
        bizEmail: state.currentUser ? (state.currentUser.email || '') : '',
        bizPhone: '',
        bizAddress: '',
        invNumber: '',
        invCurrency: '$',
        invDate: '',
        invDue: '',
        clientCompany: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        items: [],
        discount: 0,
        shipping: 0,
        notes: ''
    };

    // Reset Forms
    const textInputs = [
        'biz-name', 'biz-email', 'biz-phone', 'biz-address',
        'inv-number', 'client-company', 'client-name',
        'client-email', 'client-phone', 'client-address',
        'inv-notes', 'item-desc'
    ];
    textInputs.forEach(id => {
        const el = document.getElementById(id);
        if (id === 'biz-name' && state.userProfile && state.userProfile.bizName) {
            el.value = state.userProfile.bizName;
        } else if (id === 'biz-email' && state.currentUser && state.currentUser.email) {
            el.value = state.currentUser.email;
        } else {
            el.value = '';
        }
    });

    // Reset selects & numbers
    document.getElementById('inv-currency').value = '$';
    document.getElementById('item-qty').value = '1';
    document.getElementById('item-price').value = '0.00';
    document.getElementById('item-tax').value = '0';
    document.getElementById('inv-discount').value = '0';
    document.getElementById('inv-shipping').value = '0';

    // Clear logo elements
    document.getElementById('logo-input').value = '';
    document.getElementById('logo-preview').src = '';
    document.querySelector('.logo-preview-wrapper').style.display = 'none';
    document.querySelector('.logo-upload-label').style.display = 'flex';
    document.getElementById('inv-preview-logo').src = '';
    document.getElementById('inv-preview-logo-container').style.display = 'none';

    // Dates
    setDefaultDates();

    // Re-trigger visual previews with default fallback placeholders
    const bindings = [
        { previewId: 'preview-biz-name', defaultVal: state.userProfile ? (state.userProfile.bizName || 'Your Company Name') : 'Your Company Name' },
        { previewId: 'preview-biz-email', defaultVal: state.currentUser ? (state.currentUser.email || 'email@company.com') : 'email@company.com' },
        { previewId: 'preview-biz-phone', defaultVal: '+1 (555) 000-1234' },
        { previewId: 'preview-biz-address', defaultVal: '123 Street Address, City, State' },
        { previewId: 'preview-inv-number', defaultVal: 'INV-00000' },
        { previewId: 'preview-client-company', defaultVal: 'Client Company Name' },
        { previewId: 'preview-client-name', defaultVal: 'Contact Name' },
        { previewId: 'preview-client-email', defaultVal: 'client@email.com' },
        { previewId: 'preview-client-phone', defaultVal: '+1 (555) 000-0000' },
        { previewId: 'preview-client-address', defaultVal: 'Billing Address, City, State' },
        { previewId: 'preview-inv-notes', defaultVal: 'Payment is due upon receipt unless specified. Thank you!' }
    ];

    bindings.forEach(b => {
        const previewEl = document.getElementById(b.previewId);
        previewEl.textContent = b.defaultVal;
        previewEl.classList.add('fallback-placeholder');
        
        // Remove placeholder styling if it has a real profile value loaded
        if (b.defaultVal !== 'Your Company Name' && b.defaultVal !== 'email@company.com' && b.defaultVal !== 'INV-00000' && b.defaultVal !== 'Client Company Name' && b.defaultVal !== 'Contact Name' && b.defaultVal !== 'client@email.com' && b.defaultVal !== 'Billing Address, City, State' && b.defaultVal !== 'Payment is due upon receipt unless specified. Thank you!') {
            previewEl.classList.remove('fallback-placeholder');
        }
    });

    renderItems();
    updateTotals();
}

// ==========================================================================
// Cloud Persistence Layer & CRUD Sync
// ==========================================================================
function saveCurrentInvoice() {
    const invoiceNum = state.currentInvoice.invNumber.trim();
    const company = state.currentInvoice.bizName.trim();
    
    if (invoiceNum === '') {
        showToast('Please enter an Invoice Number before saving.', 'error');
        document.getElementById('inv-number').focus();
        return;
    }

    if (company === '') {
        showToast('Please enter your Company Name before saving.', 'error');
        document.getElementById('biz-name').focus();
        return;
    }

    // Prepare Invoice Object to save
    const invoiceToSave = {
        id: invoiceNum, // Unique Key (We use Invoice Number)
        savedAt: new Date().toISOString(),
        ...state.currentInvoice
    };

    // If authenticated, save to Firestore
    if (state.currentUser) {
        showToast('Syncing invoice with cloud...');
        const db = firebase.firestore();
        db.collection('users').doc(state.currentUser.uid).collection('invoices').doc(invoiceNum).set(invoiceToSave)
            .then(() => {
                // Update local state cache
                const existingIndex = state.savedInvoices.findIndex(inv => inv.id === invoiceNum);
                if (existingIndex > -1) {
                    state.savedInvoices[existingIndex] = invoiceToSave;
                    showToast(`Invoice ${invoiceNum} updated in cloud!`);
                } else {
                    state.savedInvoices.unshift(invoiceToSave);
                    showToast(`Invoice ${invoiceNum} saved to cloud!`);
                }
                renderSavedInvoicesList();
            })
            .catch(err => {
                console.error("Firestore save failed:", err);
                showToast("Failed to save invoice to cloud", "error");
            });
    } else {
        // Fallback to local storage if not authenticated (though UI should prevent this)
        const existingIndex = state.savedInvoices.findIndex(inv => inv.id === invoiceNum);
        if (existingIndex > -1) {
            state.savedInvoices[existingIndex] = invoiceToSave;
            showToast(`Invoice ${invoiceNum} updated locally!`);
        } else {
            state.savedInvoices.push(invoiceToSave);
            showToast(`Invoice ${invoiceNum} saved locally!`);
        }
        localStorage.setItem('invoices_list', JSON.stringify(state.savedInvoices));
        renderSavedInvoicesList();
    }
}

function loadSavedInvoicesList() {
    if (state.currentUser) {
        const db = firebase.firestore();
        db.collection('users').doc(state.currentUser.uid).collection('invoices').orderBy('savedAt', 'desc')
            .get()
            .then(querySnapshot => {
                state.savedInvoices = [];
                querySnapshot.forEach(doc => {
                    state.savedInvoices.push(doc.data());
                });
                renderSavedInvoicesList();
                checkLocalMigration(); // Check if migration is possible
            })
            .catch(err => {
                console.error("Firestore load failed:", err);
                showToast("Failed to load invoices from cloud", "error");
            });
    } else {
        // Fallback local storage
        const rawData = localStorage.getItem('invoices_list');
        if (rawData) {
            try {
                state.savedInvoices = JSON.parse(rawData);
            } catch (e) {
                console.error('Failed to parse local storage invoices', e);
                state.savedInvoices = [];
            }
        } else {
            state.savedInvoices = [];
        }
        renderSavedInvoicesList();
    }
}

function renderSavedInvoicesList() {
    const listEl = document.getElementById('saved-invoices-list');
    const placeholder = document.getElementById('saved-invoices-placeholder');

    listEl.innerHTML = '';

    if (state.savedInvoices.length === 0) {
        placeholder.style.display = 'flex';
        listEl.style.display = 'none';
    } else {
        placeholder.style.display = 'none';
        listEl.style.display = 'flex';

        // Sort saved invoices by savedAt date descending
        const sorted = [...state.savedInvoices].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        sorted.forEach(inv => {
            // Calculate total for displaying in the card
            let subtotal = 0;
            let tax = 0;
            inv.items.forEach(it => {
                const sub = it.quantity * it.price;
                subtotal += sub;
                tax += sub * ((it.tax || 0) / 100);
            });
            const grandTotal = subtotal + tax - (inv.discount || 0) + (inv.shipping || 0);

            const li = document.createElement('li');
            li.className = 'saved-invoice-card animate-fadeIn';
            li.setAttribute('data-id', inv.id);

            // Structure Card UI
            li.innerHTML = `
                <div class="saved-invoice-header">
                    <span class="saved-invoice-id">${escapeHTML(inv.invNumber)}</span>
                    <span class="saved-invoice-date">${formatDateString(inv.invDate)}</span>
                </div>
                <div class="saved-invoice-client">
                    To: ${escapeHTML(inv.clientCompany || inv.clientName || 'Unnamed Client')}
                </div>
                <div class="saved-invoice-footer">
                    <span class="saved-invoice-total">${formatCurrency(grandTotal, inv.invCurrency)}</span>
                    <div class="saved-invoice-actions">
                        <button type="button" class="btn-icon-danger btn-delete-saved" data-id="${inv.id}" title="Delete Saved Invoice">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;

            // Load when clicking the card itself (except when clicking buttons inside it)
            li.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-saved')) return;
                loadInvoiceToForm(inv);
            });

            listEl.appendChild(li);
        });

        // Add Delete Button Listeners
        listEl.querySelectorAll('.btn-delete-saved').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const invId = btn.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete invoice ${invId}?`)) {
                    if (state.currentUser) {
                        showToast("Deleting cloud invoice...");
                        const db = firebase.firestore();
                        db.collection('users').doc(state.currentUser.uid).collection('invoices').doc(invId).delete()
                            .then(() => {
                                state.savedInvoices = state.savedInvoices.filter(inv => inv.id !== invId);
                                renderSavedInvoicesList();
                                showToast(`Invoice ${invId} deleted from cloud.`);
                            })
                            .catch(err => {
                                console.error("Firestore delete failed:", err);
                                showToast("Failed to delete invoice from cloud", "error");
                            });
                    } else {
                        state.savedInvoices = state.savedInvoices.filter(inv => inv.id !== invId);
                        localStorage.setItem('invoices_list', JSON.stringify(state.savedInvoices));
                        renderSavedInvoicesList();
                        showToast(`Invoice ${invId} deleted.`);
                    }
                }
            });
        });
    }

    lucide.createIcons();
}

function loadInvoiceToForm(inv) {
    state.currentInvoice = JSON.parse(JSON.stringify(inv)); // Deep clone state

    // Populate standard text inputs
    document.getElementById('biz-name').value = inv.bizName || '';
    document.getElementById('biz-email').value = inv.bizEmail || '';
    document.getElementById('biz-phone').value = inv.bizPhone || '';
    document.getElementById('biz-address').value = inv.bizAddress || '';
    document.getElementById('inv-number').value = inv.invNumber || '';
    document.getElementById('inv-date').value = inv.invDate || '';
    document.getElementById('inv-due').value = inv.invDue || '';
    document.getElementById('client-company').value = inv.clientCompany || '';
    document.getElementById('client-name').value = inv.clientName || '';
    document.getElementById('client-email').value = inv.clientEmail || '';
    document.getElementById('client-phone').value = inv.clientPhone || '';
    document.getElementById('client-address').value = inv.clientAddress || '';
    document.getElementById('inv-notes').value = inv.notes || '';
    
    // Selects and special elements
    document.getElementById('inv-currency').value = inv.invCurrency || '$';
    document.getElementById('inv-discount').value = inv.discount || '0';
    document.getElementById('inv-shipping').value = inv.shipping || '0';

    // Logo Handling
    const logoInput = document.getElementById('logo-input');
    const logoPreview = document.getElementById('logo-preview');
    const logoPreviewWrapper = document.querySelector('.logo-preview-wrapper');
    const uploadLabel = document.querySelector('.logo-upload-label');
    const invPreviewLogo = document.getElementById('inv-preview-logo');
    const invPreviewLogoContainer = document.getElementById('inv-preview-logo-container');

    logoInput.value = '';
    if (inv.logo) {
        logoPreview.src = inv.logo;
        logoPreviewWrapper.style.display = 'inline-block';
        uploadLabel.style.display = 'none';

        invPreviewLogo.src = inv.logo;
        invPreviewLogoContainer.style.display = 'block';
    } else {
        logoPreview.src = '';
        logoPreviewWrapper.style.display = 'none';
        uploadLabel.style.display = 'flex';

        invPreviewLogo.src = '';
        invPreviewLogoContainer.style.display = 'none';
    }

    // Refresh Text Previews
    const textPreviewMap = [
        { id: 'preview-biz-name', val: inv.bizName, fallback: 'Your Company Name' },
        { id: 'preview-biz-email', val: inv.bizEmail, fallback: 'email@company.com' },
        { id: 'preview-biz-phone', val: inv.bizPhone, fallback: '+1 (555) 000-1234' },
        { id: 'preview-biz-address', val: inv.bizAddress, fallback: '123 Street Address, City, State' },
        { id: 'preview-inv-number', val: inv.invNumber, fallback: 'INV-00000' },
        { id: 'preview-inv-date', val: inv.invDate, fallback: 'YYYY-MM-DD' },
        { id: 'preview-inv-due', val: inv.invDue, fallback: 'YYYY-MM-DD' },
        { id: 'preview-client-company', val: inv.clientCompany, fallback: 'Client Company Name' },
        { id: 'preview-client-name', val: inv.clientName, fallback: 'Contact Name' },
        { id: 'preview-client-email', val: inv.clientEmail, fallback: 'client@email.com' },
        { id: 'preview-client-phone', val: inv.clientPhone, fallback: '+1 (555) 000-0000' },
        { id: 'preview-client-address', val: inv.clientAddress, fallback: 'Billing Address, City, State' },
        { id: 'preview-inv-notes', val: inv.notes, fallback: 'Payment is due upon receipt unless specified. Thank you!' }
    ];

    textPreviewMap.forEach(item => {
        const previewEl = document.getElementById(item.id);
        if (item.val) {
            previewEl.textContent = item.val;
            previewEl.classList.remove('fallback-placeholder');
        } else {
            previewEl.textContent = item.fallback;
            previewEl.classList.add('fallback-placeholder');
        }
    });

    renderItems();
    updateTotals();
    showToast(`Invoice ${inv.invNumber} loaded into editor!`);

    // Force tab shift to Business Details to let them edit it
    document.querySelector('.tab-btn[data-tab="tab-business"]').click();
}

// ==========================================================================
// Demo Data Loader (for Rich Aesthetics Demonstration)
// ==========================================================================
function loadDemoData() {
    const demoInvoice = {
        logo: '', // We can generate a sample svg logo or keep it blank default
        bizName: 'Stellaris Digital Agency',
        bizEmail: 'accounts@stellaris.design',
        bizPhone: '+1 (800) 555-0199',
        bizAddress: '450 Blue Ocean Boulevard, Suite 300\nSan Francisco, CA 94107',
        invNumber: 'INV-2026-8941',
        invCurrency: '$',
        invDate: '2026-06-07',
        invDue: '2026-06-22',
        clientCompany: 'Apex Software Labs',
        clientName: 'Sarah Jenkins',
        clientEmail: 'billing@apexlabs.io',
        clientPhone: '+1 (415) 888-0245',
        clientAddress: '100 Silicon Highway, Block B\nSan Jose, CA 95112',
        items: [
            {
                id: 'demo-1',
                description: 'UI/UX Interactive Dashboard Design - Design & Wireframing sprints',
                quantity: 42,
                price: 150.00,
                tax: 8
            },
            {
                id: 'demo-2',
                description: 'Frontend Architecture Implementation (TailwindCSS, Next.js, Framer Motion integration)',
                quantity: 60,
                price: 180.00,
                tax: 8
            },
            {
                id: 'demo-3',
                description: 'PostgreSQL Database Modeling & API Optimization consultations',
                quantity: 12,
                price: 200.00,
                tax: 0
            }
        ],
        discount: 500.00,
        shipping: 50.00,
        notes: 'Payment is due within 15 days of invoice issue date. \n\nWire Transfer details:\nBank: Blue Ribbon Trust\nAccount: 1294-8841-0941\nRouting: 021000021\n\nThank you for working with Stellaris. We appreciate your partnership!'
    };

    loadInvoiceToForm(demoInvoice);
    showToast('Demo data loaded successfully!');
}

// ==========================================================================
// Toast Notification & Helper Functions
// ==========================================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    // Toggle theme
    toast.className = 'toast-notification show';
    if (type === 'error') {
        toast.classList.add('error');
    }
    
    // Reset timer
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function formatCurrency(amount, currencySymbol) {
    return `${currencySymbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatDateString(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    
    // Returns e.g. Jun 7, 2026
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================================================
// Firebase User Authentication & Configurations UI Controllers
// ==========================================================================
function setupFirebaseAuth() {
    const authContainer = document.getElementById('auth-container');
    const authFormsPane = document.getElementById('auth-forms-pane');
    const configPane = document.getElementById('firebase-config-pane');
    const setupBanner = document.getElementById('firebase-setup-banner');
    
    // 1. If Firebase is not configured, load direct config panel and show warnings
    if (!window.firebaseConfigured) {
        // auth-container is already visible by default
        setupBanner.style.display = 'flex';
        authFormsPane.style.display = 'none';
        configPane.style.display = 'block';
        
        // Pre-populate configuration settings panel from existing window config if exists
        prepopulateConfigFields();
        setupConfigHandlers();
        return;
    }
    
    // 2. If configured, set up normal auth flow
    // auth-container is visible by default (in HTML), no need to show it here
    setupBanner.style.display = 'none';
    authFormsPane.style.display = 'block';
    configPane.style.display = 'none';
    
    prepopulateConfigFields();
    setupConfigHandlers();
    setupAuthFormHandlers();
    
    // Attach user profile sign out event
    document.getElementById('btn-signout').addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            showToast("Signed out successfully!");
        }).catch(err => {
            console.error("Signout error:", err);
            showToast("Failed to sign out", "error");
        });
    });
    
    // Attach configuration toggle links in the footer/header
    document.getElementById('link-open-config').addEventListener('click', (e) => {
        e.preventDefault();
        authFormsPane.style.display = 'none';
        configPane.style.display = 'block';
    });
    
    document.getElementById('link-open-config-footer').addEventListener('click', (e) => {
        e.preventDefault();
        authFormsPane.style.display = 'none';
        configPane.style.display = 'block';
    });
    
    document.getElementById('btn-back-to-auth').addEventListener('click', () => {
        if (!window.firebaseConfigured) {
            showToast("Firebase must be configured first.", "error");
            return;
        }
        configPane.style.display = 'none';
        authFormsPane.style.display = 'block';
    });
    
    // Listen for auth state change
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            handleUserSignedIn(user);
        } else {
            handleUserSignedOut();
        }
    });
}

function prepopulateConfigFields() {
    const cfg = window.currentFirebaseConfig || {};
    document.getElementById('cfg-apikey').value = cfg.apiKey || '';
    document.getElementById('cfg-projectid').value = cfg.projectId || '';
    document.getElementById('cfg-authdomain').value = cfg.authDomain || '';
    document.getElementById('cfg-storagebucket').value = cfg.storageBucket || '';
    document.getElementById('cfg-msgid').value = cfg.messagingSenderId || '';
    document.getElementById('cfg-appid').value = cfg.appId || '';
}

function setupConfigHandlers() {
    const configForm = document.getElementById('firebase-config-form');
    const btnClearConfig = document.getElementById('btn-clear-config');
    
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customConfig = {
            apiKey: document.getElementById('cfg-apikey').value.trim(),
            projectId: document.getElementById('cfg-projectid').value.trim(),
            authDomain: document.getElementById('cfg-authdomain').value.trim() || undefined,
            storageBucket: document.getElementById('cfg-storagebucket').value.trim() || undefined,
            messagingSenderId: document.getElementById('cfg-msgid').value.trim() || undefined,
            appId: document.getElementById('cfg-appid').value.trim() || undefined
        };
        
        const res = window.saveAndInitFirebase(customConfig);
        if (res.success) {
            showToast(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(res.message, "error");
        }
    });
    
    btnClearConfig.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your custom Firebase settings?")) {
            window.clearFirebaseConfig();
        }
    });
}

// Translates raw Firebase error codes into friendly user messages
function getFirebaseErrorMessage(err) {
    const code = err.code || '';
    const message = (err.message || '').toLowerCase();

    // "Identity Toolkit API has not been used / is disabled" — appears as a long URL-based message
    if (message.includes('identity-toolkit-api-has-not-been-used') || message.includes('identitytoolkit') || message.includes('api-has-not-been-used') || message.includes('it-is-disabled')) {
        return 'The Firebase Identity Toolkit API is not enabled. Go to Google Cloud Console → APIs & Services → Enable "Identity Toolkit API", then wait a few minutes and try again.';
    }

    // Email/Password sign-in not enabled — check both code and message variants
    if (code === 'auth/operation-not-allowed' ||
        code.includes('operation-not-allowed') ||
        code.includes('admin-restricted-operation') ||
        message.includes('operation-not-allowed') ||
        message.includes('signinwithpassword are blocked')) {
        return 'Email/Password sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method → Enable "Email/Password".';
    }

    switch (code) {
        case 'auth/invalid-email':            return 'Invalid email address format.';
        case 'auth/user-disabled':            return 'This account has been disabled.';
        case 'auth/user-not-found':           return 'No account found with this email.';
        case 'auth/wrong-password':           return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':       return 'Email or password is incorrect.';
        case 'auth/email-already-in-use':     return 'An account with this email already exists.';
        case 'auth/weak-password':            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/network-request-failed':   return 'Network error. Check your internet connection.';
        case 'auth/too-many-requests':        return 'Too many failed attempts. Please try again later.';
        case 'auth/popup-closed-by-user':     return 'Sign-in popup was closed. Please try again.';
        case 'auth/configuration-not-found':  return 'Firebase configuration error. Check your project settings.';
        case 'auth/app-not-authorized':       return 'This app is not authorized to use Firebase Auth. Check your API key and authorized domains.';
        case 'auth/api-key-not-valid':        return 'Invalid Firebase API key. Please check your Firebase configuration.';
        default: return err.message || 'An unexpected error occurred. Please try again.';
    }
}

function setupAuthFormHandlers() {
    const btnTabSignin = document.getElementById('btn-tab-signin');
    const btnTabSignup = document.getElementById('btn-tab-signup');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const linkSwitchSignup = document.getElementById('link-switch-signup');
    const authSwitchText = document.getElementById('auth-switch-text');
    
    function showSignin() {
        btnTabSignin.classList.add('active');
        btnTabSignup.classList.remove('active');
        signinForm.style.display = 'flex';
        signupForm.style.display = 'none';
        authSwitchText.innerHTML = `Don't have an account? <a href="#" id="link-switch-signup">Sign up</a>`;
        // reattach listener
        document.getElementById('link-switch-signup').addEventListener('click', (e) => {
            e.preventDefault();
            showSignup();
        });
    }
    
    function showSignup() {
        btnTabSignup.classList.add('active');
        btnTabSignin.classList.remove('active');
        signupForm.style.display = 'flex';
        signinForm.style.display = 'none';
        authSwitchText.innerHTML = `Already have an account? <a href="#" id="link-switch-signin">Sign in</a>`;
        // reattach listener
        document.getElementById('link-switch-signin').addEventListener('click', (e) => {
            e.preventDefault();
            showSignin();
        });
    }
    
    btnTabSignin.addEventListener('click', showSignin);
    btnTabSignup.addEventListener('click', showSignup);
    linkSwitchSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });
    
    // Sign In Submission
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const submitBtn = document.getElementById('btn-signin-submit');
        
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Signing In...</span> <div class="pulse-indicator" style="animation: pulse 1s infinite"></div>`;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                showToast("Welcome back!");
            })
            .catch(err => {
                console.error("Sign in failed:", err);
                showToast(getFirebaseErrorMessage(err), "error");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
    });
    
    // Sign Up Submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bizName = document.getElementById('signup-bizname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const submitBtn = document.getElementById('btn-signup-submit');
        
        if (password.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }
        
        if (password !== confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }
        
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Creating Account...</span>`;
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Update display name
                return user.updateProfile({ displayName: bizName }).then(() => {
                    // Create user profile in firestore
                    const db = firebase.firestore();
                    return db.collection('users').doc(user.uid).set({
                        bizName: bizName,
                        email: email,
                        createdAt: new Date().toISOString()
                    });
                });
            })
            .then(() => {
                showToast("Account created successfully!");
            })
            .catch(err => {
                console.error("Registration failed:", err);
                showToast(getFirebaseErrorMessage(err), "error");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
    });
}

function handleUserSignedIn(user) {
    state.currentUser = user;
    
    // Fetch profile
    const db = firebase.firestore();
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                state.userProfile = doc.data();
            } else {
                state.userProfile = { bizName: user.displayName || '', email: user.email };
            }
            
            // Set business fields on UI if empty
            const bizNameInput = document.getElementById('biz-name');
            const bizEmailInput = document.getElementById('biz-email');
            
            if (bizNameInput.value.trim() === '') {
                bizNameInput.value = state.userProfile.bizName || '';
                bizNameInput.dispatchEvent(new Event('input'));
            }
            if (bizEmailInput.value.trim() === '') {
                bizEmailInput.value = user.email || '';
                bizEmailInput.dispatchEvent(new Event('input'));
            }
            
            // Update profile widget details
            updateProfileWidget(user, state.userProfile);
        })
        .catch(err => {
            console.error("Failed to load user profile:", err);
            updateProfileWidget(user, { bizName: user.displayName || '', email: user.email });
        });
        
    // Hide auth screen, show main app
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    // Load invoices from Firestore
    loadSavedInvoicesList();
}

function handleUserSignedOut() {
    state.currentUser = null;
    state.userProfile = null;
    state.savedInvoices = [];
    
    // Clear forms and state
    resetCurrentForm();
    
    // Hide profile widget
    document.getElementById('user-profile-widget').style.display = 'none';
    
    // Hide migration banner
    document.getElementById('local-migration-banner').style.display = 'none';
    
    // Show auth screen, hide main app
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-forms-pane').style.display = 'block';
    document.getElementById('firebase-config-pane').style.display = 'none';
    
    // Clear credentials forms
    document.getElementById('signin-email').value = '';
    document.getElementById('signin-password').value = '';
    document.getElementById('signup-bizname').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    
    // Reset buttons
    const signinBtn = document.getElementById('btn-signin-submit');
    if (signinBtn) {
        signinBtn.disabled = false;
        signinBtn.innerHTML = `<span>Sign In</span> <i data-lucide="arrow-right"></i>`;
    }
    const signupBtn = document.getElementById('btn-signup-submit');
    if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.innerHTML = `<span>Create Account</span> <i data-lucide="user-plus"></i>`;
    }
    
    renderSavedInvoicesList();
}

function updateProfileWidget(user, profile) {
    const widget = document.getElementById('user-profile-widget');
    const initialsEl = document.getElementById('user-avatar-initials');
    const emailEl = document.getElementById('user-display-email');
    const bizEl = document.getElementById('user-display-biz');
    
    emailEl.textContent = user.email;
    bizEl.textContent = profile.bizName || 'Business Profile';
    
    // Calculate initials
    let initials = 'US';
    if (profile.bizName) {
        const words = profile.bizName.split(/\s+/);
        if (words.length >= 2) {
            initials = (words[0][0] + words[1][0]).toUpperCase();
        } else {
            initials = words[0].substring(0, 2).toUpperCase();
        }
    } else if (user.email) {
        initials = user.email.substring(0, 2).toUpperCase();
    }
    initialsEl.textContent = initials;
    
    widget.style.display = 'flex';
    lucide.createIcons();
}

// ==========================================================================
// Local Storage Migration System (Local-to-Cloud sync)
// ==========================================================================
function checkLocalMigration() {
    if (!state.currentUser) return;
    
    const rawData = localStorage.getItem('invoices_list');
    if (rawData) {
        try {
            const localInvoices = JSON.parse(rawData);
            if (localInvoices && localInvoices.length > 0) {
                // Show banner
                const banner = document.getElementById('local-migration-banner');
                banner.style.display = 'flex';
                
                // Set click action
                const btnMigrate = document.getElementById('btn-import-local-invoices');
                // Remove existing event listeners by cloning
                const newBtn = btnMigrate.cloneNode(true);
                btnMigrate.parentNode.replaceChild(newBtn, btnMigrate);
                
                newBtn.addEventListener('click', () => {
                    migrateLocalInvoices(rawData);
                });
            }
        } catch (e) {
            console.error("Local migration check failed parsing:", e);
        }
    }
}

function migrateLocalInvoices(rawData) {
    try {
        const localInvoices = JSON.parse(rawData);
        const db = firebase.firestore();
        const batch = db.batch();
        const userRef = db.collection('users').doc(state.currentUser.uid);
        
        localInvoices.forEach(inv => {
            const invoiceNum = inv.invNumber || inv.id || 'INV-' + Math.floor(Math.random() * 100000);
            const docRef = userRef.collection('invoices').doc(invoiceNum);
            
            const invoiceToSave = {
                id: invoiceNum,
                savedAt: inv.savedAt || new Date().toISOString(),
                ...inv
            };
            batch.set(docRef, invoiceToSave);
        });
        
        const btnImport = document.getElementById('btn-import-local-invoices');
        btnImport.disabled = true;
        btnImport.textContent = "Syncing...";
        
        batch.commit()
            .then(() => {
                showToast(`Successfully imported ${localInvoices.length} invoices to the cloud!`);
                // Move local invoices to historical backup
                localStorage.setItem('invoices_list_migrated', rawData);
                localStorage.removeItem('invoices_list');
                
                // Hide banner
                document.getElementById('local-migration-banner').style.display = 'none';
                
                // Reload
                loadSavedInvoicesList();
            })
            .catch(err => {
                console.error("Batch migration failed:", err);
                showToast("Failed to sync legacy invoices", "error");
                btnImport.disabled = false;
                btnImport.textContent = "Import";
            });
    } catch (e) {
        console.error("Migration parse failed:", e);
        showToast("Error processing local data", "error");
    }
}
