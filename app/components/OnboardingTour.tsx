'use client';

import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useDesktopNavOptional } from '@/app/hooks/useDesktopNav';
import {
  ONBOARDING_TOUR_STORAGE_KEY,
  DASHBOARD_TOUR_SELECTORS,
  buildDashboardTourSteps,
  isDesktopTourViewport,
  prepareDesktopTourRail,
  queryTourElements,
} from '@/app/lib/tour/dashboardTourConfig';

function removeDriverArtifacts(): void {
  document.querySelector('.driver-overlay')?.remove();
  document.querySelector('.driver-popover')?.remove();
  document.querySelectorAll('[class*="driver-"]').forEach((el) => el.remove());
  document.querySelectorAll('.driver-highlighted-element').forEach((el) => {
    el.classList.remove('driver-highlighted-element');
  });
}

async function waitForDesktopRail(maxMs = 2500): Promise<void> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const rail = document.querySelector(DASHBOARD_TOUR_SELECTORS.desktopNavRail);
    if (rail instanceof HTMLElement && rail.clientWidth > 48) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export default function OnboardingTour() {
  const tourStartedRef = useRef(false);
  const tourInstanceRef = useRef<ReturnType<typeof driver> | null>(null);
  const completionHandledRef = useRef(false);
  const desktopNav = useDesktopNavOptional();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.get('forceTour') === 'true';

    if (forceTour) {
      localStorage.removeItem(ONBOARDING_TOUR_STORAGE_KEY);
    }

    const hasSeenTour = localStorage.getItem(ONBOARDING_TOUR_STORAGE_KEY) === 'true';
    if ((hasSeenTour && !forceTour) || tourStartedRef.current) {
      return;
    }

    const handleTourCompletion = () => {
      if (completionHandledRef.current) return;
      completionHandledRef.current = true;

      localStorage.setItem(ONBOARDING_TOUR_STORAGE_KEY, 'true');
      tourInstanceRef.current?.destroy();
      tourInstanceRef.current = null;
      removeDriverArtifacts();

      window.setTimeout(() => {
        removeDriverArtifacts();
        const importSection = document.querySelector(DASHBOARD_TOUR_SELECTORS.dataInputDeck);
        if (importSection instanceof HTMLElement) {
          importSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          importSection.classList.add('tour-highlight');
          window.setTimeout(() => importSection.classList.remove('tour-highlight'), 2000);
        }
      }, 400);
    };

    const startTour = async () => {
      const importDeck = document.querySelector(DASHBOARD_TOUR_SELECTORS.dataInputDeck);
      if (!importDeck) {
        window.setTimeout(startTour, 500);
        return;
      }

      const isDesktop = isDesktopTourViewport();

      if (isDesktop) {
        prepareDesktopTourRail();
        desktopNav?.open();
        await waitForDesktopRail();
      }

      const elements = queryTourElements();
      const steps = buildDashboardTourSteps(isDesktop ? 'desktop' : 'mobile', elements);

      if (steps.length === 0) {
        return;
      }

      tourStartedRef.current = true;

      const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: "Let's Go!",
        overlayOpacity: 0.5,
        onNextClick: (_element, step, { driver: d }) => {
          const progressText = step.popover?.progressText ?? '';
          const progressMatch = progressText.match(/(\d+)\s+of\s+(\d+)/);
          const isLastStep =
            d.getActiveIndex() === steps.length - 1 ||
            (progressMatch !== null && progressMatch[1] === progressMatch[2]);

          if (isLastStep) {
            d.destroy();
            handleTourCompletion();
            return;
          }
          d.moveNext();
        },
        onCloseClick: (_element, _step, { driver: d }) => {
          d.destroy();
          handleTourCompletion();
        },
        onDestroyed: () => {
          handleTourCompletion();
        },
        steps,
      });

      tourInstanceRef.current = tour;
      tour.drive();
    };

    const timeoutId = window.setTimeout(() => {
      void startTour();
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
      tourInstanceRef.current?.destroy();
      tourInstanceRef.current = null;
    };
  }, [desktopNav]);

  return null;
}
