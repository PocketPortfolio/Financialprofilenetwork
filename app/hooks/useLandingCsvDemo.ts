'use client';

import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { trackEvent } from '@/app/lib/analytics/events';
import type { LandingPageVariant } from '@/lib/landing-retail-variant';
import { logLandingCsvAha } from '@/app/hooks/useLandingAbTelemetry';

function isCsvLikeFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.csv') ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'text/plain'
  );
}

type UseLandingCsvDemoOptions = {
  landingVariant?: LandingPageVariant;
};

export function useLandingCsvDemo(options: UseLandingCsvDemoOptions = {}) {
  const { landingVariant } = options;
  const [terminalActive, setTerminalActive] = useState(false);
  const [showFoundersSnare, setShowFoundersSnare] = useState(false);
  const [terminalMountKey, setTerminalMountKey] = useState(0);

  const handleHeroDemoFile = useCallback((file: File | undefined) => {
    if (!file || !isCsvLikeFile(file)) return;
    setShowFoundersSnare(false);
    setTerminalActive(false);
    setTerminalMountKey((k) => k + 1);
    setTimeout(() => {
      setTerminalActive(true);
      trackEvent('landing_hero_demo_csv_drop', { location: 'hero_dropzone' });
    }, 0);
  }, []);

  const handleHeroDropZoneDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleHeroDropZoneDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    handleHeroDemoFile(f);
  };

  const handleHeroDemoInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleHeroDemoFile(f);
    e.target.value = '';
  };

  const handleSanitizationSequenceComplete = useCallback(() => {
    setShowFoundersSnare(true);
    trackEvent('landing_hero_sanitization_complete', { location: 'hero_dropzone' });
    if (landingVariant) {
      logLandingCsvAha(landingVariant);
    }
  }, [landingVariant]);

  const dismissFoundersSnare = useCallback(() => {
    setShowFoundersSnare(false);
    setTerminalActive(false);
  }, []);

  return {
    terminalActive,
    showFoundersSnare,
    terminalMountKey,
    handleHeroDemoFile,
    handleHeroDropZoneDragOver,
    handleHeroDropZoneDrop,
    handleHeroDemoInputChange,
    handleSanitizationSequenceComplete,
    dismissFoundersSnare,
  };
}
