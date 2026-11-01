const ADJECTIVES = [
  "Aqua", "Azure", "Amber", "Golden", "Emerald", "Ruby", "Crimson", "Silver",
  "Cosmic", "Lunar", "Solar", "Velvet", "Shadow", "Mystic", "Swift", "Brave",
  "Frost", "Thunder", "Blaze", "Iron", "Silent", "Neon", "Crystal", "Polar"
];

const ANIMALS = [
  "Falcon", "Otter", "Panther", "Tiger", "Eagle", "Fox", "Wolf", "Lynx",
  "Dolphin", "Hawk", "Badger", "Panda", "Cheetah", "Jaguar", "Osprey", "Bear",
  "Phoenix", "Raven", "Koala", "Gazelle", "Leopard", "Penguin", "Whale", "Owl"
];

export function generateDisplayName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}
