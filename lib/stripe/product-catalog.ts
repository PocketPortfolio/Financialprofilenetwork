/**
 * Single Source of Truth for Pocket Portfolio Products
 * 
 * This catalog is synced with Stripe and must reflect ONLY real products.
 * The AI Sales Pilot can ONLY pitch products from this list.
 */

export interface Product {
  id: string;
  name: string;
  displayName: string;
  price: number;
  currency: 'GBP' | 'USD';
  billing: 'one-time' | 'monthly' | 'annual';
  targetAudience: string;
  aiPitchStrategy: string;
  stripePriceId: string;
  dealValue: number; // For revenue calculations (annualized if applicable)
}

export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'foundersClub',
    name: 'Founders Club',
    displayName: 'Founder\'s Club (Lifetime)',
    price: 100,
    currency: 'GBP',
    billing: 'one-time',
    targetAudience: 'CTOs, Solo Devs, Early Adopters',
    aiPitchStrategy: 'Lifetime access, influence the roadmap, sovereign data. Perfect for technical leaders who value privacy and want to own their financial data forever.',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB || 'price_1Sg3ykD4sftWa1Wtheztc1hR',
    dealValue: 100, // One-time, so annualized = 100
  },
  {
    id: 'corporateSponsor', // Keep ID for backward compatibility
    name: 'Corporate Ecosystem',
    displayName: 'Corporate Ecosystem',
    price: 1000,
    currency: 'USD',
    billing: 'annual',
    targetAudience: 'Fintechs, Agencies, Hiring Teams',
    aiPitchStrategy: 'Logo on repo, support the ecosystem, premium badge. Ideal for companies building financial products who want to align with privacy-first infrastructure.',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL || 'price_1SgPLzD4sftWa1WtzrgPU5tj',
    dealValue: 1000, // Annual, so monthly = 83.33
  },
  {
    id: 'featureVoter', // Keep ID for backward compatibility
    name: 'Developer Utility',
    displayName: 'Developer Utility',
    price: 200,
    currency: 'USD',
    billing: 'annual',
    targetAudience: 'Power Users',
    aiPitchStrategy: 'Priority feature requests, insider Discord access, unlimited API calls for stock prices and market data. For developers who want to shape the product roadmap.',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER_ANNUAL || 'price_1SgPHJD4sftWa1WtW03Tzald',
    dealValue: 200, // Annual, so monthly = 16.67
  },
  {
    id: 'codeSupporter',
    name: 'Code Supporter',
    displayName: 'Code Supporter',
    price: 50,
    currency: 'USD',
    billing: 'annual',
    targetAudience: 'Fans, Junior Devs',
    aiPitchStrategy: 'Buy me a coffee, get a badge. Support the open-source project.',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER_ANNUAL || 'price_1SgPGYD4sftWa1WtLgEjFV93',
    dealValue: 50, // Annual, so monthly = 4.17
  },
];

/**
 * Get product by ID
 */
export function getProduct(productId: string): Product | undefined {
  return PRODUCT_CATALOG.find(p => p.id === productId);
}

/**
 * Get products by target audience
 */
export function getProductsByAudience(audience: string): Product[] {
  return PRODUCT_CATALOG.filter(p => 
    p.targetAudience.toLowerCase().includes(audience.toLowerCase())
  );
}

/**
 * Get best product for lead based on company size and context
 */
export function getBestProductForLead(context: {
  employeeCount?: number;
  companyType?: string;
  isIndividual?: boolean;
}): Product {
  // Corporate sponsors are the highest value - prioritize for companies
  if (context.employeeCount && context.employeeCount >= 10) {
    const corporate = PRODUCT_CATALOG.find(p => p.id === 'corporateSponsor');
    if (corporate) return corporate;
  }
  
  // For individuals or small teams, recommend Founders Club
  if (context.isIndividual || !context.employeeCount || context.employeeCount < 10) {
    const founders = PRODUCT_CATALOG.find(p => p.id === 'foundersClub');
    if (founders) return founders;
  }
  
  // Default to Founders Club
  return PRODUCT_CATALOG.find(p => p.id === 'foundersClub') || PRODUCT_CATALOG[0];
}

/**
 * Get all active products (for AI context)
 */
export function getActiveProducts(): Product[] {
  return PRODUCT_CATALOG;
}

/**
 * Calculate monthly revenue value for a product
 */
export function getMonthlyRevenueValue(product: Product): number {
  if (product.billing === 'one-time') {
    return product.dealValue / 12; // Annualize one-time payments
  } else if (product.billing === 'annual') {
    return product.dealValue / 12;
  } else {
    return product.dealValue;
  }
}

