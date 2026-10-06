import { OrderByItem, WhereArg } from '@prisma/orm-postgres/relational-core';
import { or } from '@prisma/orm-postgres/orm-client';
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

type SortableFieldAccessor = {
  asc: () => OrderByItem;
  desc: () => OrderByItem;
};

type SearchExpression = Parameters<typeof or>[number];

type SearchableFieldAccessor = {
  ilike: (value: string) => SearchExpression;
};

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

    const escapedSearch = this.query.search
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');

    return `%${escapedSearch}%`;
  }

  get offset(): number {
    return (this.query.page - 1) * this.query.perPage;
  }

  get limit(): number {
    return this.query.perPage;
  }

  get hasSearch(): boolean {
    return Boolean(this.searchPattern);
  }

  applyPagination<TResult>(query: {
    select: (...fields: TQuery['fields']) => {
      offset: (offset: number) => {
        limit: (limit: number) => TResult;
      };
    };
  }): TResult {
    return query
      .select(...this.fields)
      .offset(this.offset)
      .limit(this.limit);
  }

  applySort<TModel, TResult>(query: {
    orderBy: (callback: (model: TModel) => OrderByItem) => TResult;
  }): TResult {
    const { field, direction } = this.sort;

    return query.orderBy((model) => {
      const modelField = (model as Record<string, SortableFieldAccessor>)[
        field
      ];

      return direction === 'asc' ? modelField.asc() : modelField.desc();
    });
  }

  buildSearchCondition<TModel>(model: TModel) {
    const search = this.searchPattern;

    if (!search) {
      throw new Error('Search term is required');
    }

    const searchableModel = model as Record<string, SearchableFieldAccessor>;

    return or(
      ...this.searchable.map((field) => searchableModel[field].ilike(search)),
    );
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
