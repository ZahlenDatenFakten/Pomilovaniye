import { useState, useCallback } from 'react';
import { recognizeAndExtract, ExtractedData } from '../lib/ocrExtractor';

export function useOcrExtractor() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractedData | null>(null);

  const extract = useCallback(async (imageUrl: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setData(null);

    try {
      const result = await recognizeAndExtract(imageUrl, (p) => {
        setProgress(p);
      });
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка распознавания');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setProgress(0);
    setLoading(false);
  }, []);

  return {
    extract,
    reset,
    loading,
    progress,
    error,
    data
  };
}
