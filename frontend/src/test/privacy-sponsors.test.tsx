import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSponsorsQuery } from '@/api/queries/useSponsorsQuery';
import { HttpUtil } from '@/utils';

describe('Privacy Edition sponsors', () => {
  it('returns no advertisements without an HTTP request or query provider', () => {
    const get = vi.spyOn(HttpUtil, 'get');
    try {
      const { result, rerender } = renderHook(() => useSponsorsQuery());
      rerender();
      expect(result.current).toEqual({ data: { sponsors: [] }, fetched: true });
      expect(get).not.toHaveBeenCalled();
    } finally {
      get.mockRestore();
    }
  });
});
