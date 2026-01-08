/**
 * AEO Schema Extraction for Blog Posts
 * Extracts FAQ, HowTo, and QAPage schemas from blog content for Answer Engine Optimization
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  position: number;
}

/**
 * Extract FAQ items from blog content
 * Looks for FAQ sections, Q&A patterns, or question-answer pairs
 */
export function extractFAQsFromContent(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];

  // Pattern 1: FAQ section with headers
  const faqSectionRegex = /##+\s*FAQ[s]?|##+\s*Frequently\s+Asked\s+Questions/gi;
  const faqMatch = content.match(faqSectionRegex);
  
  if (faqMatch) {
    // Extract content after FAQ header
    const faqIndex = content.search(faqSectionRegex);
    const faqSection = content.substring(faqIndex);
    
    // Match Q&A pairs: "**Q:**" or "**Question:**" followed by "**A:**" or "**Answer:**"
    const qaRegex = /\*\*Q:\*\*|\*\*Question:\*\*/gi;
    let lastIndex = 0;
    let match;
    
    while ((match = qaRegex.exec(faqSection)) !== null) {
      const questionStart = match.index;
      const questionEnd = faqSection.indexOf('\n\n', questionStart);
      const questionText = faqSection
        .substring(questionStart, questionEnd !== -1 ? questionEnd : faqSection.length)
        .replace(/\*\*Q:\*\*|\*\*Question:\*\*/gi, '')
        .trim();
      
      // Find answer (next paragraph or **A:** marker)
      const answerStart = questionEnd !== -1 ? questionEnd + 2 : faqSection.length;
      const answerEnd = faqSection.indexOf('\n\n', answerStart);
      let answerText = faqSection
        .substring(answerStart, answerEnd !== -1 ? answerEnd : faqSection.length)
        .replace(/\*\*A:\*\*|\*\*Answer:\*\*/gi, '')
        .trim();
      
      // If answer starts with **, it might be a marker - skip it
      if (answerText.startsWith('**')) {
        const nextPara = faqSection.indexOf('\n\n', answerEnd !== -1 ? answerEnd + 2 : answerStart);
        answerText = faqSection
          .substring(nextPara !== -1 ? nextPara + 2 : answerStart, faqSection.length)
          .replace(/\*\*A:\*\*|\*\*Answer:\*\*/gi, '')
          .trim();
      }
      
      if (questionText && answerText && answerText.length > 20) {
        faqs.push({
          question: questionText,
          answer: answerText.substring(0, 500), // Limit answer length
        });
      }
    }
  }

  // Pattern 2: Question headers (## Question: ...) followed by answer paragraphs
  const questionHeaderRegex = /##+\s+(.+?)\?/g;
  let headerMatch;
  const seenQuestions = new Set<string>();
  
  while ((headerMatch = questionHeaderRegex.exec(content)) !== null) {
    const question = headerMatch[1].trim() + '?';
    if (seenQuestions.has(question)) continue;
    seenQuestions.add(question);
    
    // Get content after the header until next header
    const answerStart = headerMatch.index + headerMatch[0].length;
    const nextHeaderMatch = content.substring(answerStart).match(/^##+\s+/m);
    const answerEnd = (nextHeaderMatch && typeof nextHeaderMatch.index === 'number')
      ? answerStart + nextHeaderMatch.index 
      : content.length;
    
    const answerText = content
      .substring(answerStart, answerEnd)
      .replace(/^[\s\n]+|[\s\n]+$/g, '')
      .substring(0, 500);
    
    if (answerText.length > 20) {
      faqs.push({ question, answer: answerText });
    }
  }

  return faqs.slice(0, 10); // Limit to 10 FAQs
}

/**
 * Extract HowTo steps from blog content
 * Looks for numbered lists, step-by-step sections, or "How to" patterns
 */
export function extractHowToSteps(content: string, title: string): HowToStep[] {
  const steps: HowToStep[] = [];

  // Pattern 1: Numbered list (1., 2., 3. or 1), 2), 3))
  const numberedListRegex = /^\d+[.)]\s+(.+)$/gm;
  let stepMatch;
  let position = 1;
  
  while ((stepMatch = numberedListRegex.exec(content)) !== null && position <= 20) {
    const stepText = stepMatch[1].trim();
    if (stepText.length > 10) {
      steps.push({
        name: `Step ${position}`,
        text: stepText.substring(0, 300),
        position,
      });
      position++;
    }
  }

  // Pattern 2: "Step X:" or "Step X -" patterns
  if (steps.length === 0) {
    const stepHeaderRegex = /Step\s+\d+[:\-]\s+(.+)$/gim;
    position = 1;
    
    while ((stepMatch = stepHeaderRegex.exec(content)) !== null && position <= 20) {
      const stepText = stepMatch[1].trim();
      if (stepText.length > 10) {
        steps.push({
          name: `Step ${position}`,
          text: stepText.substring(0, 300),
          position,
        });
        position++;
      }
    }
  }

  // Pattern 3: If title contains "How to" and we have steps, create HowTo schema
  if (steps.length === 0 && title.toLowerCase().includes('how to')) {
    // Try to extract from bullet points or paragraphs after "How to" section
    const howToSection = content.match(/##+\s*How\s+to[^#]*/i);
    if (howToSection) {
      const sectionContent = howToSection[0];
      const paragraphRegex = /^(.+)$/gm;
      position = 1;
      
      let paraMatch;
      while ((paraMatch = paragraphRegex.exec(sectionContent)) !== null && position <= 10) {
        const paraText = paraMatch[1].trim();
        // Skip headers, code blocks, and very short paragraphs
        if (paraText.length > 30 && !paraText.startsWith('#') && !paraText.startsWith('```')) {
          steps.push({
            name: `Step ${position}`,
            text: paraText.substring(0, 300),
            position,
          });
          position++;
        }
      }
    }
  }

  return steps.slice(0, 20); // Limit to 20 steps
}

/**
 * Generate FAQPage schema from FAQs
 */
export function generateFAQPageSchema(faqs: FAQItem[], url: string) {
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate HowTo schema from steps
 */
export function generateHowToSchema(
  title: string,
  description: string,
  steps: HowToStep[],
  url: string
) {
  if (steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    url: url,
    step: steps.map(step => ({
      '@type': 'HowToStep',
      position: step.position,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Generate QAPage schema (combines Article + FAQ)
 */
export function generateQAPageSchema(
  title: string,
  description: string,
  faqs: FAQItem[],
  url: string
) {
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: description,
      acceptedAnswer: {
        '@type': 'Answer',
        text: description,
      },
      suggestedAnswer: faqs.map(faq => ({
        '@type': 'Answer',
        text: faq.answer,
      })),
    },
  };
}

