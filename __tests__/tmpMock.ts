function id () {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function tmpName() {
  return `tmp${id()}`;
}
