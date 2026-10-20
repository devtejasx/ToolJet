'use strict';

const mockDb = { listCollections: () => ({ toArray: async () => [] }) };
const mockClient = { connect: jest.fn(), db: jest.fn(() => mockDb), close: jest.fn() };

jest.mock('mongodb', () => ({ MongoClient: jest.fn(() => mockClient) }));

const { MongoClient } = require('mongodb');
const mongodb = require('../lib');

describe('mongodb', () => {
  describe('dynamic database', () => {
    const service = new mongodb.default();
    const manual = { connection_type: 'manual', host: 'localhost', port: '27017', database: 'tenant_default' };
    const fromString = { connection_type: 'string', connection_string: 'mongodb://user:pass@localhost:27017/admin' };

    beforeEach(() => {
      MongoClient.mockClear();
      mockClient.db.mockClear();
    });

    it('uses the database from the query when dynamic connection parameters are allowed', async () => {
      await service.run(
        { ...manual, allow_dynamic_connection_parameters: true },
        { operation: 'list_collections', database: 'tenant_42' }
      );

      expect(mockClient.db).toHaveBeenCalledWith('tenant_42');
    });

    it('connects with the same URI and only switches the database', async () => {
      await service.run(fromString, { operation: 'list_collections' });
      await service.run(
        { ...fromString, allow_dynamic_connection_parameters: true },
        { operation: 'list_collections', database: 'tenant_42' }
      );

      expect(MongoClient.mock.calls[1][0]).toEqual(MongoClient.mock.calls[0][0]);
      expect(mockClient.db).toHaveBeenLastCalledWith('tenant_42');
    });

    it('falls back to the configured database when the query leaves it empty', async () => {
      await service.run(
        { ...manual, allow_dynamic_connection_parameters: true },
        { operation: 'list_collections', database: '  ' }
      );

      expect(mockClient.db).toHaveBeenCalledWith('tenant_default');
    });

    it('ignores the query database when the toggle is off', async () => {
      await service.run(manual, { operation: 'list_collections', database: 'tenant_42' });

      expect(mockClient.db).toHaveBeenCalledWith('tenant_default');
    });
  });
});
