import type { ApiQueryPolicy } from '../schemas/api-query.schema.js';

interface ApiQueryShape {
  fields: readonly [string, ...string[]];
  include?: readonly string[];
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  search?: string;
  page: number;
  perPage: number;
}

export class ApiQueryBuilder<
  TQuery extends ApiQueryShape,
  TPolicy extends ApiQueryPolicy,
> {
  constructor(
    readonly query: TQuery,
    readonly policy: TPolicy,
  ) {}

  get fields(): TQuery['fields'] {
    return this.query.fields;
  }

  get searchable(): TPolicy['searchable'] {
    return this.policy.searchable;
  }

  get sort(): TQuery['sort'] {
    return this.query.sort;
  }

  get searchPattern(): string | undefined {
    if (!this.query.search) {
      return undefined;
    }

    return `%${this.query.search}%`;
  }

  get offset(): number {
    return (this.query.page - 1) * this.query.perPage;
  }

  get limit(): number {
    return this.query.perPage;
  }

  hasInclude(include: TPolicy['includes'][number]): boolean {
    return this.query.include?.includes(include) ?? false;
  }

  paginate<T>(data: T[], total: number) {
    return {
      data,
      meta: {
        page: this.query.page,
        perPage: this.query.perPage,
        total,
        totalPages: Math.ceil(total / this.query.perPage),
      },
    };
  }
}
