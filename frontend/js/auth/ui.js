import { logInfo } from '../logger.js';
import { loadWatchlist } from '../watchlist/manager.js';
import { fetchCurrentUser, login, logout, signup } from './api.js';
import {
  clearSession,
  getAuthToken,
  getAuthUser,
  saveSession,
} from './state.js';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutButton = document.getElementById('logoutButton');
const authGuestControls = document.getElementById('authGuestControls');
const authUserControls = document.getElementById('authUserControls');
const authUserEmail = document.getElementById('authUserEmail');

const loginModalElement = document.getElementById('loginModal');
const signupModalElement = document.getElementById('signupModal');
const bootstrapModal = window.bootstrap?.Modal;

export function initialiseAuthUI() {
  hookForm(loginForm, handleLoginSubmit);
  hookForm(signupForm, handleSignupSubmit);
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  updateNavbar();
}

export async function verifySession() {
  try {
    const token = getAuthToken();
    if (!token) {
      updateNavbar();
      return;
    }
    const response = await fetchCurrentUser();
    if (response?.data) {
      saveSession(token, response.data);
    }
  } catch (error) {
    logInfo('Session verification failed', error.message);
    clearSession();
  } finally {
    updateNavbar();
  }
}

function hookForm(form, handler) {
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormError(form);
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    await handler(form);
  });
}

async function handleLoginSubmit(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  toggleButtonLoading(submitButton, true);
  try {
    const formData = new FormData(form);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    const response = await login(payload);
    if (response?.data?.session?.access_token && response?.data?.user) {
      saveSession(response.data.session.access_token, response.data.user);
      logInfo('User logged in', response.data.user.email);
      closeModal(loginModalElement);
      form.reset();
      form.classList.remove('was-validated');
      clearFormError(form);
      updateNavbar();
      loadWatchlist();
    }
  } catch (error) {
    showFormError(form, error.message || 'Login failed');
  } finally {
    toggleButtonLoading(submitButton, false);
  }
}

async function handleSignupSubmit(form) {
  const confirmField = form.querySelector('#signupConfirm');
  const passwordField = form.querySelector('#signupPassword');
  if (confirmField && passwordField) {
    confirmField.setCustomValidity(
      confirmField.value === passwordField.value ? '' : 'Passwords do not match'
    );
  }
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  toggleButtonLoading(submitButton, true);
  try {
    const formData = new FormData(form);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    const response = await signup(payload);
    if (response?.data?.session?.access_token && response?.data?.user) {
      saveSession(response.data.session.access_token, response.data.user);
      logInfo('User registered', response.data.user.email);
      closeModal(signupModalElement);
      form.reset();
      form.classList.remove('was-validated');
      clearFormError(form);
      updateNavbar();
      loadWatchlist();
    }
  } catch (error) {
    showFormError(form, error.message || 'Sign up failed');
  } finally {
    toggleButtonLoading(submitButton, false);
  }
}

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    logInfo('Logout request failed, clearing session locally', error);
  } finally {
    clearSession();
    updateNavbar();
    loadWatchlist();
  }
}

function updateNavbar() {
  const user = getAuthUser();
  const isAuthenticated = Boolean(user);

  if (authGuestControls) {
    authGuestControls.classList.toggle('d-none', isAuthenticated);
  }
  if (authUserControls) {
    authUserControls.classList.toggle('d-none', !isAuthenticated);
  }
  if (authUserEmail) {
    authUserEmail.textContent = user?.email || '';
  }
}

function toggleButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
  } else if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

function closeModal(element) {
  if (!element || !bootstrapModal) return;
  const instance =
    bootstrapModal.getInstance(element) || new bootstrapModal(element);
  instance.hide();
}

function showFormError(form, message) {
  const alert = form.querySelector('.auth-error');
  if (alert) {
    alert.textContent = message;
    alert.classList.remove('d-none');
  } else {
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-danger auth-error mt-3';
    feedback.textContent = message;
    form.appendChild(feedback);
  }
}

function clearFormError(form) {
  const alert = form.querySelector('.auth-error');
  if (alert) {
    alert.remove();
  }
}
