import { getQueryVariables, withJsArguments } from '../queryPanel';

const emptyMappings = { components: {}, queries: {} };

describe('getQueryVariables', () => {
  test('returns empty object for an empty array', () => {
    expect(getQueryVariables([], undefined, emptyMappings)).toStrictEqual({});
  });

  test('returns empty object for a string without dynamic variables', () => {
    expect(getQueryVariables('options type is string', undefined, emptyMappings)).toStrictEqual({});
  });

  test('returns empty object for an object without dynamic variables', () => {
    expect(getQueryVariables({ key: 'value' }, undefined, emptyMappings)).toStrictEqual({});
  });

  test('resolves dynamic variables in multi-line strings', () => {
    const state = {
      components: {
        dropdown1: {
          value: 2,
        },
      },
    };
    const options = {
      case1: `{{1 == 1 ?  "select * from users;" : "select user from users"}}`,
      case2: `select
      *
      from
      users
      where
      id
      =
      {{1 == 1 ?  "select * from users;" : "select user from users"}}`,
      case3: `select {{components.dropdown1.value  ??  1}} from users`,
    };

    expect(getQueryVariables(options.case1, state, emptyMappings)).toEqual({
      '{{1 == 1 ?  "select * from users;" : "select user from users"}}': 'select * from users;',
    });
    expect(getQueryVariables(options.case2, state, emptyMappings)).toEqual({
      '{{1 == 1 ?  "select * from users;" : "select user from users"}}': 'select * from users;',
    });
    expect(getQueryVariables(options.case3, state, emptyMappings)).toEqual({
      '{{components.dropdown1.value  ??  1}}': 2,
    });
  });

  test('masks organization constants', () => {
    const result = getQueryVariables('select * from {{constants.tableName}}', {}, emptyMappings);
    expect(result).toEqual({ '{{constants.HiddenOrganizationConstant}}': undefined });
  });

  test('recurses into nested objects and arrays', () => {
    const state = { components: { dropdown1: { value: 2 } } };
    const options = {
      nested: [{ query: 'select {{components.dropdown1.value  ??  1}} from users' }],
    };

    expect(getQueryVariables(options, state, emptyMappings)).toEqual({
      '{{components.dropdown1.value  ??  1}}': 2,
    });
  });
});

describe('withJsArguments', () => {
  // Minimal stand-in for a Pyodide PyProxy: toJs() turns Python dicts into Maps
  const pyProxy = (jsValue) => ({ toJs: () => jsValue });

  test('converts Python lists of dicts into plain arrays of objects', () => {
    const generateFile = jest.fn();
    const actions = withJsArguments({ generateFile });

    actions.generateFile(
      'runpycsv',
      'csv',
      pyProxy([
        new Map([
          ['name', 'John'],
          ['email', 'john@tooljet.com'],
        ]),
      ])
    );

    expect(generateFile).toHaveBeenCalledWith('runpycsv', 'csv', [{ name: 'John', email: 'john@tooljet.com' }]);
  });

  test('converts nested dicts and sets', () => {
    const setVariable = jest.fn();

    withJsArguments({ setVariable }).setVariable('user', pyProxy(new Map([['roles', new Set(['admin'])]])));

    expect(setVariable).toHaveBeenCalledWith('user', { roles: ['admin'] });
  });

  test('passes plain JS arguments through and keeps the return value', () => {
    const showAlert = jest.fn(() => 'shown');

    expect(withJsArguments({ showAlert }).showAlert('info', 'Saved', 3)).toEqual('shown');
    expect(showAlert).toHaveBeenCalledWith('info', 'Saved', 3);
  });

  test('keeps non-function members as they are', () => {
    const meta = { mode: 'edit' };

    expect(withJsArguments({ meta }).meta).toBe(meta);
  });
});
