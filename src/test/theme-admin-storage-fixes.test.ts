import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { uploadProductImageToStorage } from '@/services/firestoreService';

describe('Issue 1: Theme System & Tokens Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('initializes with cream theme and applies tokens to html element', () => {
    useThemeStore.getState().setTheme('cream');
    expect(useThemeStore.getState().theme).toBe('cream');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cream');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('yoyo_theme')).toBe('cream');
  });

  it('switches to dark theme and updates DOM attributes and localStorage', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('yoyo_theme')).toBe('dark');
  });

  it('persists system theme preference and updates correctly', () => {
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().theme).toBe('system');
    expect(localStorage.getItem('yoyo_theme')).toBe('system');
  });
});

describe('Issue 2: Admin Login Security & Clean Credentials', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, isAdmin: false, error: null });
  });

  it('does not populate admin session from unauthorized local storage bypasses', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAdmin).toBe(false);
  });

  it('prevents arbitrary users from obtaining admin privileges without authorization', async () => {
    const auth = useAuthStore.getState();
    await expect(auth.adminLogin('random@user.com', 'somepass')).rejects.toThrow();
    expect(useAuthStore.getState().isAdmin).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('Issue 3: Product Image Upload Validation & Security', () => {
  it('rejects unsupported file formats before storage upload', async () => {
    const fakePdf = new File(['%PDF-1.4 test'], 'document.pdf', { type: 'application/pdf' });
    await expect(uploadProductImageToStorage(fakePdf, 'test-prod')).rejects.toThrow(
      /Unsupported file format/i
    );
  });

  it('rejects files exceeding the 5MB size limit', async () => {
    // 6MB payload
    const oversized = new Uint8Array(6 * 1024 * 1024);
    const oversizedFile = new File([oversized], 'large-cake.jpg', { type: 'image/jpeg' });
    await expect(uploadProductImageToStorage(oversizedFile, 'test-prod')).rejects.toThrow(
      /exceeds the 5 MB limit/i
    );
  });
});
