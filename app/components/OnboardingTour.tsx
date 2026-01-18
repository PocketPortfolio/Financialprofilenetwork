'use client';

import { useEffect, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function OnboardingTour() {
  const tourStartedRef = useRef(false);
  const tourInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Allow forcing tour via URL parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.get('forceTour') === 'true';
    
    if (forceTour) {
      localStorage.removeItem('pocket_onboarding_seen');
    }

    // Check if tour was already completed
    const hasSeenTour = localStorage.getItem('pocket_onboarding_seen');
    
    // Debug logging
    console.log('[OnboardingTour] Debug:', {
      hasSeenTour,
      forceTour,
      tourStarted: tourStartedRef.current,
      willShow: !hasSeenTour || forceTour
    });

    if ((hasSeenTour === 'true' && !forceTour) || tourStartedRef.current) {
      console.log('[OnboardingTour] Skipping - already seen or started');
      return;
    }

    // Wait for DOM to be ready
    const startTour = () => {
      // Check required elements for Sovereign dashboard
      const sovereignHeader = document.querySelector('[data-tour="sovereign-header"]');
      const morningBrief = document.querySelector('[data-tour="morning-brief"]');
      const terminalSummary = document.querySelector('[data-tour="terminal-summary"]');
      const dataInputDeck = document.querySelector('[data-tour="data-input-deck"], #add-trade');
      const foundersClubBanner = document.querySelector('[data-tour="founders-club-banner"], .founder-banner');
      const foundersClubLink = document.querySelector('a[href="/sponsor"]');
      
      // Fallback selectors for backward compatibility
      const importTrigger = document.querySelector('#import-trigger, #import');
      const privacyStatus = document.querySelector('#privacy-status');

      console.log('[OnboardingTour] Element check:', {
        sovereignHeader: !!sovereignHeader,
        morningBrief: !!morningBrief,
        terminalSummary: !!terminalSummary,
        dataInputDeck: !!dataInputDeck,
        foundersClubBanner: !!foundersClubBanner,
        foundersClubLink: !!foundersClubLink,
        importTrigger: !!importTrigger,
        privacyStatus: !!privacyStatus
      });

      // Require at least data input deck or import trigger
      if (!dataInputDeck && !importTrigger) {
        console.log('[OnboardingTour] Required elements not ready, retrying...');
        // Retry after a short delay if required elements aren't ready
        setTimeout(startTour, 500);
        return;
      }

      console.log('[OnboardingTour] Starting tour...');
      tourStartedRef.current = true;

      // Build steps array for Sovereign dashboard
      const steps: DriveStep[] = [];

      // Step 1: Welcome to Sovereign Dashboard
      if (sovereignHeader) {
        steps.push({
          element: sovereignHeader as HTMLElement,
          popover: {
            title: '🎨 Welcome to Sovereign Dashboard',
            description: 'This is your premium portfolio command center. The Sovereign design features a terminal-inspired interface with real-time data and AI-powered insights.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        });
      }

      // Step 2: AI Morning Brief (if available)
      if (morningBrief) {
        steps.push({
          element: morningBrief as HTMLElement,
          popover: {
            title: '🧠 AI Morning Brief',
            description: 'Get autonomous portfolio analysis powered by Pulitzer AI. See daily sentiment, top movers, and market insights at a glance. This updates in real-time as your portfolio changes.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        });
      }

      // Step 3: Terminal Summary (Key Metrics)
      if (terminalSummary) {
        steps.push({
          element: terminalSummary as HTMLElement,
          popover: {
            title: '📊 Terminal Summary',
            description: 'Your portfolio metrics at a glance: Total Invested, Trade Count, and Unrealized P/L. These cards update automatically as you add trades.',
            side: 'top' as const,
            align: 'start' as const,
          },
        });
      }

      // Step 4: Data Input Deck (Import & Manual Entry)
      if (dataInputDeck) {
        steps.push({
          element: dataInputDeck as HTMLElement,
          popover: {
            title: '📂 Data Ingestion Engine',
            description: 'Import CSV files from Trade Republic, Fidelity, or Trading 212, or add trades manually. Your data stays encrypted in your browser—never on our servers.',
            side: 'top' as const,
            align: 'start' as const,
          },
        });
      } else if (importTrigger) {
        // Fallback to old import trigger
        steps.push({
          element: importTrigger as HTMLElement,
          popover: {
            title: '📂 Start Here',
            description: 'Drop your CSV from Trade Republic, Fidelity, or Trading 212 here. We parse it instantly.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        });
      }

      // Step 5: Privacy Status (if available)
      if (privacyStatus) {
        steps.push({
          element: privacyStatus as HTMLElement,
          popover: {
            title: '🔒 Local-First Security',
            description: 'Your financial data is encrypted in your browser. It never reaches our servers.',
            side: 'top' as const,
            align: 'center' as const,
          },
        });
      }

      // Step 6: Premium Theme Upgrade (Founders Club)
      if (foundersClubBanner) {
        steps.push({
          element: foundersClubBanner as HTMLElement,
          popover: {
            title: '✨ Unlock Premium Sovereign Themes',
            description: 'Join the Founder\'s Club to unlock exclusive premium themes (Gold & Corporate), Google Drive sync, lifetime API access, and support the project. Limited spots available!',
            side: 'bottom' as const,
            align: 'center' as const,
          },
        });
        console.log('[OnboardingTour] Founders Club banner found - including premium theme step');
      } else if (foundersClubLink) {
        steps.push({
          element: foundersClubLink as HTMLElement,
          popover: {
            title: '✨ Unlock Premium Sovereign Themes',
            description: 'Join the Founder\'s Club to unlock exclusive premium themes (Gold & Corporate), Google Drive sync, lifetime API access, and support the project.',
            side: 'bottom' as const,
            align: 'center' as const,
          },
        });
        console.log('[OnboardingTour] Founders Club link found - including premium theme step');
      }

      // If no steps were found, use minimal fallback
      if (steps.length === 0) {
        console.log('[OnboardingTour] No Sovereign elements found, using minimal fallback');
        if (importTrigger) {
          steps.push({
            element: importTrigger as HTMLElement,
            popover: {
              title: '📂 Start Here',
              description: 'Drop your CSV from Trade Republic, Fidelity, or Trading 212 here. We parse it instantly.',
              side: 'bottom' as const,
              align: 'start' as const,
            },
          });
        }
      }
      
      if (steps.length === 0) {
        console.error('[OnboardingTour] CRITICAL: Cannot start tour with 0 steps');
        return;
      }

        // Track if we've already handled completion to prevent multiple calls
        let completionHandled = false;
        let cleanupIntervalId: NodeJS.Timeout | null = null;
        
        // Continuous cleanup monitor to catch any elements that reappear
        const startCleanupMonitor = () => {
          if (cleanupIntervalId) return; // Already monitoring
          
          cleanupIntervalId = setInterval(() => {
            const overlay = document.querySelector('.driver-overlay');
            const popover = document.querySelector('.driver-popover');
            const allDriverElements = document.querySelectorAll('[class*="driver-"]');
            
            if (overlay || popover || allDriverElements.length > 0) {
              if (overlay) overlay.remove();
              if (popover) popover.remove();
              allDriverElements.forEach(el => {
                if (el.parentNode) el.remove();
              });
            }
          }, 100); // Check every 100ms
          
          // Stop monitoring after 5 seconds
          setTimeout(() => {
            if (cleanupIntervalId) {
              clearInterval(cleanupIntervalId);
              cleanupIntervalId = null;
            }
          }, 5000);
        };
        
        const handleTourCompletion = () => {
        if (completionHandled) {
          console.log('[OnboardingTour] Completion already handled, skipping');
          return;
        }
        completionHandled = true;
        
        console.log('[OnboardingTour] Tour completed - executing actions');
        localStorage.setItem('pocket_onboarding_seen', 'true');
        
        // Start continuous cleanup monitor to catch any elements that reappear
        startCleanupMonitor();
        
        // Ensure tour is fully destroyed
        if (tourInstanceRef.current) {
          try {
            tourInstanceRef.current.destroy();
            console.log('[OnboardingTour] Tour explicitly destroyed');
          } catch (e) {
            console.log('[OnboardingTour] Tour already destroyed or error:', e);
          }
        }
        
        // Immediately remove any driver.js elements that might be lingering
        const immediateOverlay = document.querySelector('.driver-overlay');
        const immediatePopover = document.querySelector('.driver-popover');
        const allDriverElements = document.querySelectorAll('[class*="driver-"]');
        if (immediateOverlay) {
          immediateOverlay.remove();
        }
        if (immediatePopover) {
          immediatePopover.remove();
        }
        // Remove all driver-related elements as a safety measure
        allDriverElements.forEach(el => {
          if (el.parentNode) {
            el.remove();
          }
        });
        
        // Wait for overlay to be removed before scrolling
        setTimeout(() => {
          // Check if overlay is still present and remove it
          const overlay = document.querySelector('.driver-overlay');
          const popover = document.querySelector('.driver-popover');
          if (overlay) {
            console.log('[OnboardingTour] Overlay still present, forcing removal');
            overlay.remove();
          }
          if (popover) {
            console.log('[OnboardingTour] Popover still present, forcing removal');
            popover.remove();
          }
          
          // Also remove any driver highlight elements
          const highlightedElements = document.querySelectorAll('.driver-highlighted-element');
          highlightedElements.forEach(el => {
            el.classList.remove('driver-highlighted-element');
          });
          
          const importSection = document.querySelector('[data-tour="data-input-deck"], #add-trade, #import-trigger, #import');
          if (importSection) {
            console.log('[OnboardingTour] Scrolling to import section');
            importSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Optional: Add a brief highlight effect
            importSection.classList.add('tour-highlight');
            setTimeout(() => {
              importSection.classList.remove('tour-highlight');
            }, 2000);
          }
        }, 500); // Increased delay to ensure overlay is removed
      };

      const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: "Let's Go!",
        overlayOpacity: 0.5,
        onHighlightStarted: (element, step, { driver }) => {
          // Check if this is the last step
          const currentStepIndex = driver.getActiveIndex();
          const isLastStep = currentStepIndex === steps.length - 1;
          console.log('[OnboardingTour] Step highlighted:', { currentStepIndex, isLastStep, totalSteps: steps.length });
        },
        onNextClick: (element, step, { driver }) => {
          // Get current step index using driver.getActiveIndex() with error handling
          let currentStepIndex: number | null = null;
          try {
            const activeIndex = driver.getActiveIndex();
            currentStepIndex = activeIndex !== undefined ? activeIndex : null;
          } catch (e) {
            // Error getting active index - will use fallback method
          }
          
          // Fallback: Check progress text to determine if it's the last step
          const progressText = step.popover?.progressText || '';
          const progressMatch = progressText.match(/(\d+)\s+of\s+(\d+)/);
          const isLastStepByProgress = progressMatch && progressMatch[1] === progressMatch[2];
          
          // Determine if it's the last step using multiple methods
          const isLastStep = currentStepIndex !== null 
            ? currentStepIndex === steps.length - 1
            : isLastStepByProgress || false;
          
          console.log('[OnboardingTour] Next/Done button clicked:', { currentStepIndex, isLastStep, stepsLength: steps.length, progressText });
          
          // If this is the last step, the "Let's Go!" button was clicked
          if (isLastStep) {
            console.log('[OnboardingTour] "Let\'s Go!" button clicked on last step - destroying tour');
            
            // Explicitly destroy the tour - this will trigger onDestroyed
            driver.destroy();
            
            // Call completion handler directly as backup (completionHandled flag prevents double execution)
            setTimeout(() => {
              handleTourCompletion();
            }, 50);
            return; // Don't call moveNext on last step
          }
          
          // For non-last steps, explicitly move to next step
          console.log('[OnboardingTour] Moving to next step');
          driver.moveNext();
        },
        onCloseClick: (element, step, { driver }) => {
          console.log('[OnboardingTour] Close button clicked');
          // Explicitly destroy the tour when close button is clicked
          driver.destroy();
        },
        onDestroyStarted: () => {
          console.log('[OnboardingTour] Tour destroyed (started)');
          // Don't handle completion here - wait for onDestroyed
        },
        onDestroyed: () => {
          console.log('[OnboardingTour] Tour destroyed (completed)');
          handleTourCompletion();
        },
        steps,
      });

      tourInstanceRef.current = tour;

      // Start tour after a brief delay to ensure smooth rendering
      setTimeout(() => {
        console.log('[OnboardingTour] Calling tour.drive()');
        tour.drive();
      }, 1500);
    };

    // Initial delay to allow page to render
    const timeoutId = setTimeout(startTour, 1000);

    return () => {
      clearTimeout(timeoutId);
      // Clean up tour instance if component unmounts
      if (tourInstanceRef.current) {
        try {
          tourInstanceRef.current.destroy();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  return null; // Headless component
}

