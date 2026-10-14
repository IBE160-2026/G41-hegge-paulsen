export async function signIn(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(supabase, email, password, redirectTo) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) throw error;
  return data;
}

export async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(supabase, email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function loadProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, age, body_weight_kg, equipment')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveProfile(supabase, profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('id, username, age, body_weight_kg, equipment')
    .single();
  if (error) throw error;
  return data;
}

export async function saveProfileEquipment(supabase, userId, equipment) {
  const { error } = await supabase
    .from('profiles')
    .update({ equipment })
    .eq('id', userId);
  if (error) throw error;
}

export async function updatePassword(supabase, password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}