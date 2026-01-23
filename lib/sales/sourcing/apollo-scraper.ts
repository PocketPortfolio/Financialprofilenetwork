/**
 * Apollo API Scraper for UK Independent Financial Advisors (IFAs)
 * 
 * Sources leads from Apollo.io API targeting:
 * - Independent Financial Advisors
 * - Wealth Managers
 * - Financial Planners
 * - Director of Financial Planning
 * 
 * Location: United Kingdom
 * Company Size: 1-50 employees (Boutique firms - decision makers)
 */

interface ApolloLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  dataSource: 'apollo';
}

interface ApolloPerson {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  title?: string;
  organization?: {
    name: string;
    num_employees?: number;
  };
  city?: string;
  state?: string;
  country?: string;
}

interface ApolloResponse {
  people: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
  };
}

/**
 * Source leads from Apollo API
 * Targets UK IFAs with verified emails
 */
export async function sourceFromApollo(
  maxLeads?: number
): Promise<ApolloLead[]> {
  const apolloApiKey = process.env.APOLLO_API_KEY;
  
  if (!apolloApiKey) {
    console.log('⚠️  APOLLO_API_KEY not provided, skipping Apollo sourcing');
    return [];
  }

  const leads: ApolloLead[] = [];
  const maxResults = maxLeads || 50;

  try {
    console.log('🔍 Searching Apollo for UK Independent Financial Advisors...');
    
    // Apollo API endpoint
    const baseUrl = 'https://api.apollo.io/v1';
    const searchUrl = `${baseUrl}/mixed_people/search`;
    
    // Search parameters for UK IFAs
    const searchParams = {
      person_titles: [
        'Independent Financial Advisor',
        'Wealth Manager',
        'Financial Planner',
        'Director of Financial Planning',
        'IFA',
        'Chartered Financial Planner',
        'Certified Financial Planner'
      ],
      person_locations: ['United Kingdom'],
      organization_num_employees_ranges: ['1,10', '11,20', '21,50'], // Boutique firms (decision makers)
      contact_email_status: ['verified'], // Only verified emails
      page: 1,
      per_page: Math.min(maxResults, 100), // Apollo max is 100 per page
    };

    // Apollo API authentication: API key MUST be in X-Api-Key header
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey, // Apollo requires API key in header
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`⚠️  Apollo API error: ${response.status} - ${errorText}`);
      return [];
    }

    const data: ApolloResponse = await response.json();
    const people = data.people || [];

    console.log(`   Found ${people.length} potential IFA leads from Apollo`);

    for (const person of people) {
      // Skip if no email or email not verified
      if (!person.email) {
        continue;
      }

      // Skip if not in UK
      if (person.country && person.country.toLowerCase() !== 'united kingdom') {
        continue;
      }

      // Extract company name
      const companyName = person.organization?.name || 'Unknown Company';
      
      // Extract job title
      const jobTitle = person.title || 'Unknown Title';
      
      // Verify title matches IFA criteria
      const titleLower = jobTitle.toLowerCase();
      const isIFA = titleLower.includes('financial advisor') ||
                    titleLower.includes('wealth manager') ||
                    titleLower.includes('financial planner') ||
                    titleLower.includes('ifa') ||
                    titleLower.includes('chartered financial planner') ||
                    titleLower.includes('certified financial planner');

      if (!isIFA) {
        continue;
      }

      // Build location string
      const locationParts = [];
      if (person.city) locationParts.push(person.city);
      if (person.state) locationParts.push(person.state);
      if (person.country) locationParts.push(person.country);
      const location = locationParts.length > 0 ? locationParts.join(', ') : undefined;

      leads.push({
        email: person.email,
        firstName: person.first_name || undefined,
        lastName: person.last_name || undefined,
        companyName,
        jobTitle,
        location,
        dataSource: 'apollo',
      });

      if (leads.length >= maxResults) {
        break;
      }
    }

    console.log(`   ✅ Processed ${leads.length} IFA leads from Apollo`);
    return leads;

  } catch (error: any) {
    console.error('❌ Apollo API error:', error.message);
    return [];
  }
}

