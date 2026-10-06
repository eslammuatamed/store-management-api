import { describe, expect, it } from 'vitest';
import { ApiQueryBuilder } from './api-query.builder.js';

describe('ApiQueryBuilder', () => {
  const policy = {
    fields: ['id', 'name'],
    includes: ['permissions'],
    sortable: ['name'],
    searchable: ['name'],
  } as const;

  const baseQuery = {
    fields: ['id', 'name'] as const,
    sort: {
      field: 'name',
      direction: 'asc' as const,
    },
    page: 1,
    perPage: 20,
  };
  it('should wrap search value with percent signs', () => {
    const query = {
      ...baseQuery,
      search: 'admin',
    };

    const apiQuery = new ApiQueryBuilder(query, policy);

    expect(apiQuery.searchPattern).toBe('%admin%');
  });

  it('should escape percent sign in search value', () => {
    const query = {
      ...baseQuery,
      search: '50%',
    };

    const apiQuery = new ApiQueryBuilder(query, policy);

    expect(apiQuery.searchPattern).toBe('%50\\%%');
  });

  it('should escape underscore in search value', () => {
    const query = {
      ...baseQuery,
      search: 'admin_user',
    };

    const apiQuery = new ApiQueryBuilder(query, policy);

    expect(apiQuery.searchPattern).toBe('%admin\\_user%');
  });

  it('should escape backslash in search value', () => {
    const query = {
      ...baseQuery,
      search: 'admin\\user',
    };

    const apiQuery = new ApiQueryBuilder(query, policy);

    expect(apiQuery.searchPattern).toBe('%admin\\\\user%');
  });

  it('should return undefined when search value does not exist', () => {
    const apiQuery = new ApiQueryBuilder(baseQuery, policy);

    expect(apiQuery.searchPattern).toBeUndefined();
  });

  it('should return undefined when search value does not exist', () => {
    const apiQuery = new ApiQueryBuilder(baseQuery, policy);

    expect(apiQuery.searchPattern).toBeUndefined();
  });

  it('should return true when search exists', () => {
    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        search: 'admin',
      },
      policy,
    );

    expect(apiQuery.hasSearch).toBe(true);
  });

  it('should return false when search does not exist', () => {
    const apiQuery = new ApiQueryBuilder(baseQuery, policy);

    expect(apiQuery.hasSearch).toBe(false);
  });

  it('should calculate offset', () => {
    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        page: 3,
        perPage: 20,
      },
      policy,
    );

    expect(apiQuery.offset).toBe(40);
  });

  it('should return perPage as limit', () => {
    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        perPage: 50,
      },
      policy,
    );

    expect(apiQuery.limit).toBe(50);
  });

  it('should return true when include exists', () => {
    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        include: ['permissions'],
      },
      policy,
    );

    expect(apiQuery.hasInclude('permissions')).toBe(true);
  });

  it('should return false when include does not exist', () => {
    const apiQuery = new ApiQueryBuilder(baseQuery, policy);

    expect(apiQuery.hasInclude('permissions')).toBe(false);
  });

  it('should return paginated data with metadata', () => {
    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        page: 2,
        perPage: 20,
      },
      policy,
    );

    const data = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Manager' },
    ];

    const result = apiQuery.paginate(data, 45);

    expect(result).toEqual({
      data,
      meta: {
        page: 2,
        perPage: 20,
        total: 45,
        totalPages: 3,
      },
    });
  });

  it('should apply fields, offset and limit to query', () => {
    const limit = vi.fn(() => 'result');
    const offset = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ offset }));

    const query = { select };

    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        fields: ['id', 'name'] as const,
        page: 2,
        perPage: 20,
      },
      policy,
    );

    const result = apiQuery.applyPagination(query);

    expect(select).toHaveBeenCalledWith('id', 'name');
    expect(offset).toHaveBeenCalledWith(20);
    expect(limit).toHaveBeenCalledWith(20);
    expect(result).toBe('result');
  });

  it('should apply ascending sort', () => {
    const asc = vi.fn(() => 'asc-result');
    const desc = vi.fn();

    const orderBy = vi.fn((callback) =>
      callback({
        name: {
          asc,
          desc,
        },
      }),
    );

    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        sort: {
          field: 'name',
          direction: 'asc',
        },
      },
      policy,
    );

    const result = apiQuery.applySort({ orderBy });

    expect(orderBy).toHaveBeenCalledOnce();
    expect(asc).toHaveBeenCalledOnce();
    expect(desc).not.toHaveBeenCalled();
    expect(result).toBe('asc-result');
  });

  it('should apply descending sort', () => {
    const asc = vi.fn();
    const desc = vi.fn(() => 'desc-result');

    const orderBy = vi.fn((callback) =>
      callback({
        name: {
          asc,
          desc,
        },
      }),
    );

    const apiQuery = new ApiQueryBuilder(
      {
        ...baseQuery,
        sort: {
          field: 'name',
          direction: 'desc',
        },
      },
      policy,
    );

    const result = apiQuery.applySort({ orderBy });

    expect(orderBy).toHaveBeenCalledOnce();
    expect(desc).toHaveBeenCalledOnce();
    expect(asc).not.toHaveBeenCalled();
    expect(result).toBe('desc-result');
  });

  it('should throw when building search condition without search value', () => {
    const apiQuery = new ApiQueryBuilder(baseQuery, policy);

    expect(() => apiQuery.buildSearchCondition({})).toThrow(
      'Search term is required',
    );
  });
});
