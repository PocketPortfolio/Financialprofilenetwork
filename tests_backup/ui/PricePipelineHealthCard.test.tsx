import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as api from '../../src/services/api';
import PricePipelineHealthCard from '../../src/components/PricePipelineHealthCard';
import '@testing-library/jest-dom';

describe('PricePipelineHealthCard', () => {
  it('renders provider badges', async () => {
    vi.spyOn(api, 'getPriceHealth').mockResolvedValue({
      providers: [
        { provider:'yahoo', lastSuccess: Date.now(), lastFailure:null, failureCount:0, activeFallback:false },
        { provider:'chart', lastSuccess:null, lastFailure:Date.now(), failureCount:1, activeFallback:true },
        { provider:'stooq', lastSuccess:null, lastFailure:Date.now(), failureCount:3, activeFallback:false }
      ]
    });

    render(<PricePipelineHealthCard />);
    expect(await screen.findByText(/Price Pipeline Health/i)).toBeInTheDocument();
    expect(await screen.findByText(/YAHOO/i)).toBeInTheDocument();
    expect(await screen.findByText(/CHART/i)).toBeInTheDocument();
    expect(await screen.findByText(/STOOQ/i)).toBeInTheDocument();
  });
});
