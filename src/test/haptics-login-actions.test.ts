import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerHaptic, haptic, initHapticListeners } from '@/services/mobileService';

describe('Tactile Haptics & Mobile Service', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });
  });

  it('triggers light haptic feedback with Web Vibration fallback', async () => {
    await triggerHaptic('light');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('triggers medium haptic feedback with Web Vibration fallback', async () => {
    await triggerHaptic('medium');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('triggers heavy haptic feedback with Web Vibration fallback', async () => {
    await triggerHaptic('heavy');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('triggers selection haptic feedback with Web Vibration fallback', async () => {
    await triggerHaptic('selection');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('triggers success notification pattern with Web Vibration fallback', async () => {
    await triggerHaptic('success');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('triggers warning notification pattern with Web Vibration fallback', async () => {
    await triggerHaptic('warning');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('triggers error notification pattern with Web Vibration fallback', async () => {
    await triggerHaptic('error');
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('supports shorthand haptic object methods', async () => {
    await haptic.light();
    expect(vibrateMock).toHaveBeenCalled();

    await haptic.selection();
    expect(vibrateMock).toHaveBeenCalled();

    await haptic.success();
    expect(vibrateMock).toHaveBeenCalled();
  });

  it('initHapticListeners attaches delegator and triggers haptic on button click', async () => {
    const cleanup = initHapticListeners();

    // Create a button in the DOM
    const btn = document.createElement('button');
    btn.textContent = 'Add to Cart';
    document.body.appendChild(btn);

    // Simulate click
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Wait for microtask
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(vibrateMock).toHaveBeenCalled();

    // Clean up
    cleanup();
    btn.remove();
  });

  it('triggers haptic on [role="tab"] and [data-haptic] elements', async () => {
    const cleanup = initHapticListeners();

    const tab = document.createElement('div');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('data-haptic', 'medium');
    document.body.appendChild(tab);

    tab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(vibrateMock).toHaveBeenCalled();

    cleanup();
    tab.remove();
  });
});

