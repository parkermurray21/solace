import { useState } from "react";

export function useCustomMutation<T, V = void, E = Error>(
  mutationFn: (variables: V) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (variables: V) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, error, isLoading, mutate };
}
