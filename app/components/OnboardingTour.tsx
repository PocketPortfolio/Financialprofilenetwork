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
      // Check required elements (import and privacy)
      const importTrigger = document.querySelector('#import-trigger, #import');
      const privacyStatus = document.querySelector('#privacy-status');
      // Theme selector is optional (it's in a hidden menu)
      const themeSelector = document.querySelector('#theme-selector');

      console.log('[OnboardingTour] Element check:', {
        importTrigger: !!importTrigger,
        privacyStatus: !!privacyStatus,
        themeSelector: !!themeSelector
      });

      // Only require import and privacy - theme selector is optional
      if (!importTrigger || !privacyStatus) {
        console.log('[OnboardingTour] Required elements not ready, retrying...');
        // Retry after a short delay if required elements aren't ready
        setTimeout(startTour, 500);
        return;
      }

      console.log('[OnboardingTour] Starting tour...');
      tourStartedRef.current = true;

      // Build steps array - theme selector is optional
      const steps: DriveStep[] = [
        {
          element: '#import-trigger, #import',
          popover: {
            title: '📂 Start Here',
            description: 'Drop your CSV from Trade Republic, Fidelity, or Trading 212 here. We parse it instantly.',
            side: 'bottom' as const,
            align: 'start' as const,
          },
        },
        {
          element: '#privacy-status',
          popover: {
            title: '🔒 Local-First Security',
            description: 'Your financial data is encrypted in your browser. It never reaches our servers.',
            side: 'top' as const,
            align: 'center' as const,
          },
        },
      ];

      // Always include Gold theme step - use Founders Club link as target (always visible)
      // This soft-sells the premium theme to users
      const foundersClubLink = document.querySelector('a[href="/sponsor"]');
      if (foundersClubLink) {
        steps.push({
          element: 'a[href="/sponsor"]',
          popover: {
            title: '🎨 Unlock Founder\'s Gold Theme',
            description: 'Join the Founder\'s Club to unlock the exclusive Gold theme, lifetime API access, and support the project. Click here to learn more!',
            side: 'top' as const,
            align: 'center' as const,
          },
        });
        console.log('[OnboardingTour] Founders Club link found - including Gold theme step');
      } else if (themeSelector) {
        // Fallback to theme selector if Founders Club link not found
        steps.push({
          element: '#theme-selector',
          popover: {
            title: '🎨 Go Gold',
            description: 'Switch between Light, Dark, and the exclusive Founder\'s Gold theme here. Join the Founder\'s Club to unlock premium themes!',
            side: 'left' as const,
            align: 'center' as const,
          },
        });
        console.log('[OnboardingTour] Theme selector found - including in tour');
      } else {
        console.log('[OnboardingTour] Neither Founders Club link nor theme selector found - skipping Gold theme step');
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
          
          const importSection = document.querySelector('#import-trigger, #import');
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

