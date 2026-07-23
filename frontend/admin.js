const tableConfigs = {
    users: {
        title: 'Users',
        columns: ['id', 'firstName', 'lastName', 'email', 'passwordHash', 'createdAt']
    },
    events: {
        title: 'Events',
        columns: ['id', 'title', 'eventDate', 'eventTime', 'location', 'category', 'description', 'ticketPrice', 'maxAttendees', 'imagePath', 'createdAt']
    },

    contacts: {
        title: 'Contacts',
        columns: ['id', 'firstName', 'lastName', 'email', 'subject', 'message', 'createdAt']
    },
    bookings: {
        title: 'Bookings',
        columns: ['id', 'eventTitle', 'attendeeName', 'attendeeEmail', 'ticketQuantity', 'totalPrice', 'status', 'createdAt']
    },
    favorites: {
        title: 'Favorites',
        columns: ['id', 'userEmail', 'eventTitle', 'createdAt']
    },
    sessions: {
        title: 'Sessions',
        columns: ['id', 'userEmail', 'sessionToken', 'expiresAt', 'createdAt']
    }
};

const statsGrid = document.getElementById('statsGrid');
const tableSelect = document.getElementById('tableSelect');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const tableMeta = document.getElementById('tableMeta');
const refreshBtn = document.getElementById('refreshBtn');
const editModal = document.getElementById('editModal');
const editModalTitle = document.getElementById('editModalTitle');
const editForm = document.getElementById('editForm');
const editFields = document.getElementById('editFields');

let currentTableName = 'users';
let currentRows = [];
let editingRow = null;

const tableActions = {
    users: ['edit', 'delete'],
    events: ['edit', 'delete'],
    contacts: ['edit', 'delete'],
    bookings: ['edit', 'delete'],
    favorites: ['delete'],
    sessions: ['delete']
};

const editableFields = {
    users: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        // Keep password optional. Backend will only change it if provided.
        { key: 'password', label: 'New Password (plaintext)', type: 'password', optional: true }
    ],
    events: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'eventDate', label: 'Event Date', type: 'date' },
        { key: 'eventTime', label: 'Event Time', type: 'time' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
        { key: 'ticketPrice', label: 'Ticket Price', type: 'number' },
        { key: 'maxAttendees', label: 'Max Attendees', type: 'number' },
        { key: 'imagePath', label: 'Image Path', type: 'text', fullWidth: true }
    ],

    contacts: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'subject', label: 'Subject', type: 'text' },
        { key: 'message', label: 'Message', type: 'textarea', fullWidth: true }
    ],
    bookings: [
        { key: 'attendeeName', label: 'Attendee Name', type: 'text' },
        { key: 'attendeeEmail', label: 'Attendee Email', type: 'email' },
        { key: 'ticketQuantity', label: 'Ticket Quantity', type: 'number' },
        { key: 'totalPrice', label: 'Total Price', type: 'number' },
        { key: 'status', label: 'Status', type: 'text' }
    ]
};

const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || 'Unable to load data.');
    }

    return payload;
};

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return '<span class="text-gray-500">-</span>';
    }

    if (typeof value === 'number') {
        return String(value);
    }

    const text = String(value);

    if (text.length > 120) {
        return `${text.slice(0, 120)}...`;
    }

    return text;
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');

const renderStats = async () => {
    const stats = await apiRequest('/api/admin/stats');
    const items = [
        ['Users', stats.users],
        ['Events', stats.events],
        ['Contacts', stats.contacts],
        ['Bookings', stats.bookings],
        ['Favorites', stats.favorites],
        ['Sessions', stats.sessions]
    ];

    statsGrid.innerHTML = items.map(([label, value]) => `
        <div class="glass-card rounded-3xl p-6 border border-white/10">
            <p class="text-gray-400 text-sm uppercase tracking-[0.2em]">${label}</p>
            <div class="text-4xl font-bold mt-3 gradient-text">${value}</div>
        </div>
    `).join('');
};

const renderTable = async (tableName) => {
    const config = tableConfigs[tableName];

    if (!config) {
        return;
    }

    currentTableName = tableName;

    tableMeta.textContent = `Showing ${config.title.toLowerCase()} stored in SQLite.`;
    const actionHeader = tableActions[tableName] && tableActions[tableName].length > 0 ? '<th class="text-left px-4 py-3 font-semibold text-gray-300">Actions</th>' : '';
    tableHead.innerHTML = `<tr>${config.columns.map(column => `<th class="text-left px-4 py-3 font-semibold text-gray-300">${column}</th>`).join('')}${actionHeader}</tr>`;
    tableBody.innerHTML = `<tr><td class="px-4 py-6 text-gray-400" colspan="${config.columns.length}">Loading...</td></tr>`;

    try {
        const result = await apiRequest(`/api/admin/records?table=${tableName}`);
        const rows = result.rows || [];
        currentRows = rows;

        if (rows.length === 0) {
            tableBody.innerHTML = `<tr><td class="px-4 py-6 text-gray-400" colspan="${config.columns.length + 1}">No records found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = rows.map(row => `
            <tr class="align-top hover:bg-white/5 transition-colors">
                ${config.columns.map(column => `<td class="px-4 py-4 border-t border-white/10">${formatValue(row[column])}</td>`).join('')}
                ${renderActions(tableName, row)}
            </tr>
        `).join('');
    } catch (error) {
        tableBody.innerHTML = `<tr><td class="px-4 py-6 text-red-300" colspan="${config.columns.length + 1}">${error.message}</td></tr>`;
    }
};

const renderActions = (tableName, row) => {
    const actions = tableActions[tableName] || [];

    if (actions.length === 0) {
        return '';
    }

    const buttons = [];

    if (actions.includes('edit')) {
        buttons.push(`<button class="px-3 py-2 rounded-lg bg-primary-500/20 text-primary-200 hover:bg-primary-500/30 transition-colors" data-action="edit" data-table="${tableName}" data-id="${row.id}">Edit</button>`);
    }

    if (actions.includes('delete')) {
        buttons.push(`<button class="px-3 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors" data-action="delete" data-table="${tableName}" data-id="${row.id}">Delete</button>`);
    }

    return `<td class="px-4 py-4 border-t border-white/10 whitespace-nowrap"><div class="flex gap-2">${buttons.join('')}</div></td>`;
};

const openEditModal = (tableName, rowId) => {
    const row = currentRows.find(item => Number(item.id) === Number(rowId));

    if (!row) {
        return;
    }

    editingRow = { tableName, row };
    const fields = editableFields[tableName] || [];

    editModalTitle.textContent = `Edit ${tableConfigs[tableName].title.slice(0, -1)}`;
    editFields.innerHTML = fields.map(field => {
        const value = row[field.key] ?? '';

        // Never pre-fill password field values.
        const safeValue = field.key === 'password' ? '' : escapeHtml(value);

        // Keep password field optional (do not require it).
        const requiredAttr = '';


        if (field.type === 'textarea') {
            return `
                <label class="${field.fullWidth ? 'md:col-span-2' : ''} block">
                    <span class="block text-sm font-medium mb-2 text-gray-300">${field.label}</span>
                    <textarea name="${field.key}" rows="4" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary-500" ${requiredAttr}>${safeValue}</textarea>
                </label>
            `;
        }

        return `
            <label class="${field.fullWidth ? 'md:col-span-2' : ''} block">
                <span class="block text-sm font-medium mb-2 text-gray-300">${field.label}</span>
                <input name="${field.key}" type="${field.type}" value="${safeValue}" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary-500" ${requiredAttr}>
            </label>
        `;
    }).join('');

    editModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

const closeEditModal = () => {
    editingRow = null;
    editModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!editingRow) {
        return;
    }

    const formData = new FormData(editForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        await apiRequest(`/api/admin/records/${editingRow.tableName}/${editingRow.row.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        closeEditModal();
        await refreshDashboard();
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('[data-action]');

    if (!actionButton) {
        return;
    }

    const tableName = actionButton.dataset.table;
    const rowId = actionButton.dataset.id;
    const action = actionButton.dataset.action;

    if (action === 'edit') {
        openEditModal(tableName, rowId);
    }

    if (action === 'delete') {
        const confirmed = window.confirm('Are you sure you want to delete this record?');

        if (!confirmed) {
            return;
        }

        try {
            await apiRequest(`/api/admin/records/${tableName}/${rowId}`, { method: 'DELETE' });
            await refreshDashboard();
        } catch (error) {
            alert(error.message);
        }
    }
});

document.querySelectorAll('[data-close-edit-modal]').forEach(button => {
    button.addEventListener('click', closeEditModal);
});

const refreshDashboard = async () => {
    await renderStats();
    await renderTable(tableSelect.value);
};

// ---------------- init ----------------
refreshDashboard();

tableSelect.addEventListener('change', () => {
    renderTable(tableSelect.value);
});

refreshBtn.addEventListener('click', refreshDashboard);

