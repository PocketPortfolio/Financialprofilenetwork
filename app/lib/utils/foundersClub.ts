/**
 * Founders Club Scarcity Counter
 * Single source of truth for spots remaining across all pages
 * 
 * IMPORTANT: Update SOLD_SPOTS when spots are sold to maintain consistency
 * across: Dashboard banner, Sponsor page, Modals, NPM packages
 */

const TOTAL_SPOTS = 50;
const SOLD_SPOTS = 8; // Update this when spots are sold (50 - remaining = sold)
// Current: 42 spots remaining (50 - 8 = 42)

/**
 * Get the current number of spots remaining for UK Founders Club
 * @returns Number of spots remaining (0-50)
 */
export function getFoundersClubSpotsRemaining(): number {
  // TODO: Replace with API call to Firestore to get actual count
  // For now, calculate based on sold spots
  const remaining = TOTAL_SPOTS - SOLD_SPOTS;
  return Math.max(0, Math.min(remaining, TOTAL_SPOTS));
}

/**
 * Get the formatted scarcity message
 * @returns Formatted string like "42/50 Remaining"
 */
export function getFoundersClubScarcityMessage(): string {
  const remaining = getFoundersClubSpotsRemaining();
  return `${remaining}/${TOTAL_SPOTS} Remaining`;
}

/**
 * Check if Founders Club is sold out
 */
export function isFoundersClubSoldOut(): boolean {
  return getFoundersClubSpotsRemaining() <= 0;
}

