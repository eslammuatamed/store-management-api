import { z } from 'zod';

export interface ApiQueryPolicy<
  TFields extends readonly string[] = readonly string[],
  TIncludes extends readonly string[] = readonly string[],
  TSortable extends readonly string[] = readonly string[],
  TSearchable extends readonly string[] = readonly string[],
> {
  fields: TFields;
  includes: TIncludes;
  sortable: TSortable;
  searchable: TSearchable;
  defaultPerPage?: number;
  maxPerPage?: number;
}

const DEFAULT_SORT = {
  field: 'createdAt',
  direction: 'desc',
} as const;

type NonEmptyTuple<T> = [T, ...T[]];

function csvSchema<const T extends readonly string[]>(
  allowed: T,
  label: string,
): z.ZodType<NonEmptyTuple<T[number]>, string> {
  const schema = z
    .string()
    .trim()
    .min(1)
    .transform((value, ctx) => {
      const values = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (values.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} cannot be empty`,
        });

        return z.NEVER;
      }

      for (const value of values) {
        if (!allowed.includes(value)) {
          ctx.addIssue({
            code: 'custom',
            message: `${label} "${value}" is not allowed`,
          });
        }
      }

      return values as NonEmptyTuple<T[number]>;
    });

  return schema as z.ZodType<NonEmptyTuple<T[number]>, string>;
}

function sortSchema<const T extends readonly string[]>(allowed: T) {
  return z
    .string()
    .trim()
    .transform(
      (
        value,
        ctx,
      ): {
        field: T[number];
        direction: 'asc' | 'desc';
      } => {
        const [rawField, rawDirection = 'asc'] = value.split(':');

        const field = rawField.trim();
        const direction = rawDirection.trim().toLowerCase();

        if (!allowed.includes(field)) {
          ctx.addIssue({
            code: 'custom',
            message: `Sort field "${field}" is not allowed`,
          });

          return z.NEVER;
        }

        if (direction !== 'asc' && direction !== 'desc') {
          ctx.addIssue({
            code: 'custom',
            message: 'Sort direction must be asc or desc',
          });

          return z.NEVER;
        }

        return {
          field: field as T[number],
          direction,
        };
      },
    );
}

export function createApiQuerySchema<
  const TFields extends readonly [string, ...string[]],
  const TIncludes extends readonly string[],
  const TSortable extends readonly string[],
  const TSearchable extends readonly string[],
>(policy: ApiQueryPolicy<TFields, TIncludes, TSortable, TSearchable>) {
  const defaultPerPage = policy.defaultPerPage ?? 20;

  const maxPerPage = policy.maxPerPage ?? 100;

  return z
    .object({
      fields: csvSchema(policy.fields, 'Field')
        .optional()
        .transform(
          (fields): NonEmptyTuple<TFields[number]> =>
            fields ?? ([...policy.fields] as NonEmptyTuple<TFields[number]>),
        ),
      include: csvSchema(policy.includes, 'Include').optional(),
      sort: sortSchema(policy.sortable).optional().default(DEFAULT_SORT),
      search: z.string().trim().min(1).optional(),
      page: z.coerce.number().int().positive().default(1),
      perPage: z.coerce
        .number()
        .int()
        .positive()
        .max(maxPerPage)
        .default(defaultPerPage),
    })
    .strict();
}
