/**
 * MODE 3: Micro-Conversion Tracker
 * Tracks micro-interactions (button clicks, form interactions, etc.)
 */

'use client';

import { useEffect, useRef } from 'react';
import { trackMicroConversion, MicroConversionEvent } from '@/app/lib/analytics/conversion';

interface MicroConversionTrackerProps {
  elementId: string;
  event: MicroConversionEvent;
  elementType?: string;
  value?: number;
  metadata?: Record<string, any>;
  children: React.ReactNode;
  className?: string;
}

export default function MicroConversionTracker({
  elementId,
  event,
  elementType = 'button',
  value,
  metadata,
  children,
  className
}: MicroConversionTrackerProps) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleInteraction = () => {
      trackMicroConversion(event, {
        elementId,
        elementType,
        page: window.location.pathname,
        value,
        metadata
      });
    };

    // Add appropriate event listener based on element type
    if (elementType === 'button' || elementType === 'link') {
      element.addEventListener('click', handleInteraction);
    } else if (elementType === 'form') {
      element.addEventListener('submit', handleInteraction);
    } else if (elementType === 'input' || elementType === 'textarea') {
      element.addEventListener('focus', () => {
        trackMicroConversion('form_field_focus', {
          elementId,
          elementType,
          page: window.location.pathname,
          metadata
        });
      });
      element.addEventListener('blur', () => {
        trackMicroConversion('form_field_complete', {
          elementId,
          elementType,
          page: window.location.pathname,
          metadata
        });
      });
    }

    return () => {
      if (elementType === 'button' || elementType === 'link') {
        element.removeEventListener('click', handleInteraction);
      } else if (elementType === 'form') {
        element.removeEventListener('submit', handleInteraction);
      }
    };
  }, [elementId, event, elementType, value, metadata]);

  // Determine wrapper element type
  const WrapperElement = elementType === 'link' ? 'a' : 
                         elementType === 'form' ? 'form' : 
                         elementType === 'input' ? 'input' :
                         elementType === 'textarea' ? 'textarea' :
                         'div';

  return (
    <WrapperElement
      ref={elementRef as any}
      id={elementId}
      className={className}
      {...(elementType === 'link' && { href: '#' })}
    >
      {children}
    </WrapperElement>
  );
}


















