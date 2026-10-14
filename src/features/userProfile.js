export const profileEquipmentOptions = [
  { id: 'bodyweight', label: 'Kroppsvekt' },
  { id: 'dumbbell', label: 'Manualer' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'barbell', label: 'Vektstang' },
  { id: 'machine', label: 'Styrkeapparat' },
  { id: 'cable-machine', label: 'Kabelapparat' },
  { id: 'rowing-machine', label: 'Romaskin' },
  { id: 'stationary-bike', label: 'Ergometersykkel' },
  { id: 'pull-up-bar', label: 'Pull-up-stang' }
];

const profileStorageKey = 'smartokt-user-profile';
const validEquipment = new Set(profileEquipmentOptions.map((option) => option.id));

export function readUserProfile(storage = globalThis.localStorage) {
  try {
    const profile = JSON.parse(storage.getItem(profileStorageKey) || '{}');
    const equipment = Array.isArray(profile.equipment)
      ? profile.equipment.filter((item) => validEquipment.has(item))
      : ['bodyweight', 'dumbbell'];

    return { equipment: [...new Set(equipment)] };
  } catch {
    return { equipment: ['bodyweight', 'dumbbell'] };
  }
}

export function writeUserProfile(profile, storage = globalThis.localStorage) {
  const equipment = Array.isArray(profile.equipment)
    ? [...new Set(profile.equipment.filter((item) => validEquipment.has(item)))]
    : [];
  const normalizedProfile = { equipment };

  try {
    storage.setItem(profileStorageKey, JSON.stringify(normalizedProfile));
  } catch {
    // ignore storage failures in restricted environments
  }

  return normalizedProfile;
}