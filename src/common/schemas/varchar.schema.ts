import { z } from 'zod';

export type Varchar<N extends number> = string & {
  readonly __varcharLength: N;
};

export function varchar<const N extends number>(max: N, min = 1) {
  const schema = z.string().trim().min(min).max(max);

  return schema as unknown as z.ZodType<Varchar<N>, string>;
}
