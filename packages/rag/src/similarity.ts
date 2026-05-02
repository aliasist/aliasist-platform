/**
 * Cosine similarity in [-1, 1] for same-length float vectors.
 * Returns 0 if either vector has zero L2 norm.
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length === 0 || a.length !== b.length) {
    throw new Error("cosineSimilarity: vectors must be non-empty and the same length.");
  }
  let dot = 0;
  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    sumA += x * x;
    sumB += y * y;
  }
  const mag = Math.sqrt(sumA) * Math.sqrt(sumB);
  if (mag === 0) return 0;
  return dot / mag;
};
