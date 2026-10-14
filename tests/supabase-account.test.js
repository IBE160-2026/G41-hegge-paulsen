import { describe, expect, it, vi } from 'vitest';
import {
  loadProfile,
  saveProfile,
  saveProfileEquipment,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword
} from '../src/features/supabaseAccount.js';

describe('Supabase account adapter', () => {
  it('requests email confirmation with the configured app redirect', async () => {
    const signUpMock = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' }, session: null }, error: null });
    const client = { auth: { signUp: signUpMock } };

    await signUp(client, 'person@example.com', 'a-long-password', 'http://localhost:5173');

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'a-long-password',
      options: { emailRedirectTo: 'http://localhost:5173' }
    });
  });

  it('upserts profile data including the authenticated user id', async () => {
    const profile = { id: 'user-1', username: 'runner_1', age: null, body_weight_kg: null, equipment: ['bodyweight'] };
    const single = vi.fn().mockResolvedValue({ data: profile, error: null });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));
    const client = { from: vi.fn(() => ({ upsert })) };

    await expect(saveProfile(client, profile)).resolves.toEqual(profile);
    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(upsert).toHaveBeenCalledWith(profile, { onConflict: 'id' });
  });

  it('signs in with the provided credentials', async () => {
    const data = { user: { id: 'user-1' }, session: { access_token: 'token' } };
    const signInWithPassword = vi.fn().mockResolvedValue({ data, error: null });
    const client = { auth: { signInWithPassword } };

    await expect(signIn(client, 'person@example.com', 'a-long-password')).resolves.toEqual(data);
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'person@example.com', password: 'a-long-password' });
  });

  it('throws when sign-in fails', async () => {
    const authError = new Error('Invalid login credentials');
    const signInWithPassword = vi.fn().mockResolvedValue({ data: null, error: authError });
    const client = { auth: { signInWithPassword } };

    await expect(signIn(client, 'person@example.com', 'wrong-password')).rejects.toThrow(authError);
  });

  it('signs out the current session', async () => {
    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { signOut: signOutMock } };

    await signOut(client);

    expect(signOutMock).toHaveBeenCalled();
  });

  it('sends a password reset email with the configured app redirect', async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ data: {}, error: null });
    const client = { auth: { resetPasswordForEmail } };

    await sendPasswordReset(client, 'person@example.com', 'http://localhost:5173');

    expect(resetPasswordForEmail).toHaveBeenCalledWith('person@example.com', { redirectTo: 'http://localhost:5173' });
  });

  it('loads a profile by user id', async () => {
    const profile = { id: 'user-1', username: 'runner_1', age: 30, body_weight_kg: 80, equipment: ['dumbbell'] };
    const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const client = { from: vi.fn(() => ({ select })) };

    await expect(loadProfile(client, 'user-1')).resolves.toEqual(profile);
    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith('id, username, age, body_weight_kg, equipment');
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('returns null when no profile exists yet', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const client = { from: vi.fn(() => ({ select })) };

    await expect(loadProfile(client, 'user-1')).resolves.toBeNull();
  });

  it('saves the equipment list for the authenticated user', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const client = { from: vi.fn(() => ({ update })) };

    await saveProfileEquipment(client, 'user-1', ['kettlebell', 'bodyweight']);

    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(update).toHaveBeenCalledWith({ equipment: ['kettlebell', 'bodyweight'] });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('throws when saving equipment fails', async () => {
    const dbError = new Error('check constraint violated');
    const eq = vi.fn().mockResolvedValue({ error: dbError });
    const update = vi.fn(() => ({ eq }));
    const client = { from: vi.fn(() => ({ update })) };

    await expect(saveProfileEquipment(client, 'user-1', [])).rejects.toThrow(dbError);
  });

  it('updates the account password', async () => {
    const data = { user: { id: 'user-1' } };
    const updateUser = vi.fn().mockResolvedValue({ data, error: null });
    const client = { auth: { updateUser } };

    await expect(updatePassword(client, 'a-new-long-password')).resolves.toEqual(data);
    expect(updateUser).toHaveBeenCalledWith({ password: 'a-new-long-password' });
  });
});