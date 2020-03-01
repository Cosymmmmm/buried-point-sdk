export const urlMode = function () {
  if (window.location.hash) {
    return 'hash';
  }
  return 'history';
}