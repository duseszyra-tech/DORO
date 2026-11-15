// Editing permissions apply only to data in this browser.
window.doroRoles = {
  getRole: () => 'editor',
  getSubjects: () => Object.keys(window.subjects || {}),
  getDisplayName: () => 'Локальный редактор',
  isAdmin: () => false,
  isEditor: () => true,
  canEditSubject: () => true,
  ready: Promise.resolve(),
};

document.documentElement.classList.remove('role-user', 'role-admin');
document.documentElement.classList.add('role-editor');
document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new CustomEvent('doro:roles-ready', {
    detail: { role: 'editor', subjects: window.doroRoles.getSubjects() },
  }));
});
