const API_URL = (window.APP_CONFIG?.apiUrl || '').replace(/\/+$/, '');
const authView = document.querySelector('#auth-view');
const appView = document.querySelector('#app-view');
const authForm = document.querySelector('#auth-form');
const authStatus = document.querySelector('#auth-status');
const listStatus = document.querySelector('#list-status');
const formStatus = document.querySelector('#form-status');
const transactionList = document.querySelector('#transaction-list');
const transactionForm = document.querySelector('#transaction-form');
const categoryFilter = document.querySelector('#category-filter');
const monthFilter = document.querySelector('#month-filter');
const searchFilter = document.querySelector('#search-filter');
const authModeButton = document.querySelector('#auth-switch');

let authMode = 'login';
let currentUser;
let currentPage = 1;
let totalPages = 1;
let editingId;
let searchTimer;

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `${element.id === 'list-status' ? 'list-status' : 'status-message'}${type ? ` ${type}` : ''}`;
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' })
    .format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

async function request(path, options = {}) {
  if (!API_URL) throw new Error('Configura la dirección de la API en frontend/config.js.');
  const token = sessionStorage.getItem('token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('No pudimos conectar con la API. Revisa tu conexión e inténtalo otra vez.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('La API devolvió una respuesta que no pudimos leer.');
  }
  if (response.status === 401 && token) {
    logout('Tu sesión venció. Ingresa nuevamente.');
    throw new Error('Tu sesión venció. Ingresa nuevamente.');
  }
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
  return data;
}

function showApp(user) {
  currentUser = user;
  authView.hidden = true;
  appView.hidden = false;
  document.querySelector('#profile-email').textContent = user.email;
  document.querySelector('#greeting-name').textContent = user.email.split('@')[0];
  monthFilter.value = getCurrentMonth();
  document.querySelector('#transaction-date').value = getToday();
  loadTransactions();
}

function logout(message = '') {
  sessionStorage.removeItem('token');
  currentUser = undefined;
  editingId = undefined;
  appView.hidden = true;
  authView.hidden = false;
  resetTransactionForm();
  setStatus(authStatus, message, message ? 'error' : '');
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === 'register';
  document.querySelector('#auth-eyebrow').textContent = registering ? 'EMPECEMOS CON CALMA' : 'BIENVENIDA/O DE VUELTA';
  document.querySelector('#auth-title').textContent = registering ? 'Tu espacio empieza aquí.' : 'Qué bueno tenerte aquí.';
  document.querySelector('#auth-description').textContent = registering
    ? 'Crea una cuenta para empezar a entender tus gastos.'
    : 'Ingresa tus datos para ver cómo va tu mes.';
  document.querySelector('#auth-password').autocomplete = registering ? 'new-password' : 'current-password';
  document.querySelector('#auth-submit').textContent = registering ? 'Crear mi cuenta' : 'Entrar a mi espacio';
  document.querySelector('#auth-switch-copy').textContent = registering ? '¿Ya tienes una cuenta?' : '¿Todavía no tienes una cuenta?';
  authModeButton.textContent = registering ? 'Iniciar sesión' : 'Crear cuenta';
  setStatus(authStatus, '');
}

async function submitAuth(event) {
  event.preventDefault();
  const submitButton = document.querySelector('#auth-submit');
  submitButton.disabled = true;
  setStatus(authStatus, 'Un momento, estamos preparando tu espacio…');
  const formData = new FormData(authForm);
  try {
    const result = await request(`/auth/${authMode}`, {
      method: 'POST',
      body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
    });
    sessionStorage.setItem('token', result.token);
    authForm.reset();
    setStatus(authStatus, '');
    showApp(result.user);
  } catch (error) {
    setStatus(authStatus, error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

function createTransactionRow(item) {
  const row = document.createElement('div');
  row.className = 'transaction-row';
  const name = document.createElement('span');
  name.className = 'transaction-name';
  name.textContent = item.description;
  const category = document.createElement('span');
  category.className = 'category-tag';
  category.textContent = item.category;
  const date = document.createElement('span');
  date.className = 'transaction-date';
  date.textContent = formatDate(item.spent_on);
  const amount = document.createElement('span');
  amount.className = 'transaction-amount';
  amount.textContent = formatCurrency(item.amount);
  const actions = document.createElement('span');
  actions.className = 'row-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = '✎';
  editButton.setAttribute('aria-label', `Editar ${item.description}`);
  editButton.addEventListener('click', () => startEditing(item));
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Eliminar ${item.description}`);
  deleteButton.addEventListener('click', () => deleteTransaction(item.id));
  actions.append(editButton, deleteButton);
  row.append(name, category, date, amount, actions);
  return row;
}

async function loadTransactions() {
  setStatus(listStatus, 'Cargando tus gastos…');
  transactionList.replaceChildren();
  try {
    const params = new URLSearchParams({ page: String(currentPage) });
    if (monthFilter.value) params.set('month', monthFilter.value);
    if (categoryFilter.value) params.set('category', categoryFilter.value);
    if (searchFilter.value.trim()) params.set('search', searchFilter.value.trim());
    const result = await request(`/transactions?${params}`);
    for (const item of result.items) transactionList.append(createTransactionRow(item));
    const count = result.pagination.total;
    const totalAmount = Number(result.totalAmount);
    document.querySelector('#total-amount').textContent = formatCurrency(totalAmount);
    document.querySelector('#total-count').textContent = String(count);
    document.querySelector('#total-caption').textContent = count
      ? `${count === 1 ? 'Un gasto registrado' : `${count} gastos registrados`} este mes`
      : 'Lo que registres aparecerá aquí';
    totalPages = Math.max(1, Math.ceil(count / result.pagination.pageSize));
    document.querySelector('#page-caption').textContent = `Página ${currentPage} de ${totalPages}`;
    document.querySelector('#previous-page').disabled = currentPage <= 1;
    document.querySelector('#next-page').disabled = currentPage >= totalPages;
    setStatus(listStatus, count ? '' : 'Todavía no hay gastos para estos filtros. ¡Anota el primero!', count ? 'success' : '');
  } catch (error) {
    setStatus(listStatus, error.message, 'error');
  }
}

function resetTransactionForm() {
  transactionForm.reset();
  document.querySelector('#transaction-date').value = getToday();
  document.querySelector('#entry-title').textContent = 'Anota un gasto';
  document.querySelector('#entry-eyebrow').textContent = 'UN MOMENTO PARA TI';
  const submitButton = document.querySelector('#transaction-submit');
  submitButton.textContent = 'Guardar gasto';
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '↗';
  submitButton.append(icon);
  document.querySelector('#cancel-edit').hidden = true;
  editingId = undefined;
}

function startEditing(item) {
  editingId = item.id;
  document.querySelector('#transaction-description').value = item.description;
  document.querySelector('#transaction-amount').value = item.amount;
  document.querySelector('#transaction-category').value = item.category;
  document.querySelector('#transaction-date').value = item.spent_on.slice(0, 10);
  document.querySelector('#entry-title').textContent = 'Edita tu gasto';
  document.querySelector('#entry-eyebrow').textContent = 'PUEDES AJUSTARLO';
  document.querySelector('#transaction-submit').textContent = 'Guardar cambios';
  document.querySelector('#cancel-edit').hidden = false;
  setStatus(formStatus, '');
  document.querySelector('#transaction-description').focus();
}

async function saveTransaction(event) {
  event.preventDefault();
  const submitButton = document.querySelector('#transaction-submit');
  submitButton.disabled = true;
  setStatus(formStatus, 'Guardando…', 'success');
  const formData = new FormData(transactionForm);
  const body = {
    description: formData.get('description'),
    amount: Number(formData.get('amount')),
    category: formData.get('category'),
    spent_on: formData.get('spent_on'),
  };
  try {
    await request(editingId ? `/transactions/${editingId}` : '/transactions', {
      method: editingId ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });
    resetTransactionForm();
    setStatus(formStatus, 'Gasto guardado. ¡Un paso más!', 'success');
    currentPage = 1;
    await loadTransactions();
  } catch (error) {
    setStatus(formStatus, error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteTransaction(id) {
  if (!window.confirm('¿Quieres eliminar este gasto? Esta acción no se puede deshacer.')) return;
  setStatus(listStatus, 'Eliminando gasto…');
  try {
    await request(`/transactions/${id}`, { method: 'DELETE' });
    setStatus(listStatus, 'Gasto eliminado.', 'success');
    if (editingId === id) resetTransactionForm();
    await loadTransactions();
  } catch (error) {
    setStatus(listStatus, error.message, 'error');
  }
}

authForm.addEventListener('submit', submitAuth);
authModeButton.addEventListener('click', () => setAuthMode(authMode === 'login' ? 'register' : 'login'));
document.querySelector('#logout-button').addEventListener('click', () => logout());
transactionForm.addEventListener('submit', saveTransaction);
document.querySelector('#cancel-edit').addEventListener('click', resetTransactionForm);
monthFilter.addEventListener('change', () => { currentPage = 1; loadTransactions(); });
categoryFilter.addEventListener('change', () => { currentPage = 1; loadTransactions(); });
searchFilter.addEventListener('input', () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => { currentPage = 1; loadTransactions(); }, 300);
});
document.querySelector('#previous-page').addEventListener('click', () => {
  if (currentPage > 1) { currentPage -= 1; loadTransactions(); }
});
document.querySelector('#next-page').addEventListener('click', () => {
  if (currentPage < totalPages) { currentPage += 1; loadTransactions(); }
});

if (sessionStorage.getItem('token')) {
  request('/auth/me')
    .then(({ user }) => showApp(user))
    .catch((error) => {
      if (sessionStorage.getItem('token')) {
        sessionStorage.removeItem('token');
        setStatus(authStatus, error.message, 'error');
      }
    });
}
