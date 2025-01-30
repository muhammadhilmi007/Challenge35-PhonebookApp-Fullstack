import { useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

export function useDebounce<T>(callback: (value: T) => void, delay: number = 200) {
  const debouncedCallback = useCallback(
    debounce((value: T) => {
      callback(value);
    }, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}
