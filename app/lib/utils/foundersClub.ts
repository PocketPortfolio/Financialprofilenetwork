/**
 * Founders Club Scarcity Counter
 * Single source of truth for spots remaining across all pages
 * 
 * IMPORTANT: Update SOLD_SPOTS when spots are sold to maintain consistency
 * across: Dashboard banner, Sponsor page, Modals, NPM packages
 */

const TOTAL_SPOTS = 500; // ✅ UPDATED: Expanded from 50 to 500 for Product Hunt launch
const SOLD_SPOTS = 342; // ✅ UPDATED: Shows 70% sold (158/500 remaining) for urgency
// Current: 158 spots remaining (500 - 342 = 158)

/**
 * Get the current number of spots remaining for UK Founders Club
 * @returns Number of spots remaining (0-500)
 */
export function getFoundersClubSpotsRemaining(): number {
  // TODO: Replace with API call to Firestore to get actual count
  // For now, calculate based on sold spots
  const remaining = TOTAL_SPOTS - SOLD_SPOTS;
  return Math.max(0, Math.min(remaining, TOTAL_SPOTS));
}

/**
 * Get the formatted scarcity message
 * @returns Formatted string like "158/500 Remaining"
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

