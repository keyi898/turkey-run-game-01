// Keyboard and mouse input. Exposes a tiny state object the game polls each frame,
// plus one-shot "pressed" edges for jump / hide / pause / confirm.
export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  let mouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let clicked = false;

  const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

  window.addEventListener('keydown', (event) => {
    if (PREVENT.has(event.code)) event.preventDefault();
    if (!held.has(event.code)) pressed.add(event.code);
    held.add(event.code);
  });
  window.addEventListener('keyup', (event) => held.delete(event.code));
  window.addEventListener('blur', () => held.clear());

  canvas.addEventListener('pointerdown', (event) => {
    mouseDown = true;
    clicked = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  window.addEventListener('pointerup', () => { mouseDown = false; });
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });

  return {
    get left() { return held.has('ArrowLeft') || held.has('KeyA'); },
    get right() { return held.has('ArrowRight') || held.has('KeyD'); },
    get duck() { return held.has('ArrowDown') || held.has('KeyS'); },
    get sprint() { return held.has('ShiftLeft') || held.has('ShiftRight') || mouseDown; },
    get mouseX() { return mouseX; },
    get mouseY() { return mouseY; },
    get mouseDown() { return mouseDown; },
    jumpPressed() {
      return pressed.has('Space') || pressed.has('ArrowUp') || pressed.has('KeyW');
    },
    hidePressed() { return pressed.has('KeyH') || pressed.has('KeyC'); },
    pausePressed() { return pressed.has('KeyP') || pressed.has('Escape'); },
    confirmPressed() {
      return pressed.has('Enter') || pressed.has('Space') || clicked;
    },
    anyPressed() { return pressed.size > 0 || clicked; },
    endFrame() { pressed.clear(); clicked = false; },
  };
}
