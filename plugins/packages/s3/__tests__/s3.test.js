'use strict';

const { uploadObject } = require('../lib/operations');

describe('s3', () => {
  describe('uploadObject', () => {
    const send = jest.fn().mockResolvedValue({});
    const client = { send };

    beforeEach(() => send.mockClear());

    it('decodes base64 data without sending base64 as the Content-Encoding header', async () => {
      await uploadObject(client, {
        bucket: 'bucket',
        key: 'photo.png',
        data: Buffer.from('png-bytes').toString('base64'),
        contentType: 'image/png',
        encoding: 'base64',
      });

      const { input } = send.mock.calls[0][0];
      expect(input.Body.toString()).toEqual('png-bytes');
      expect(input.ContentType).toEqual('image/png');
      expect(input.ContentEncoding).toBeUndefined();
    });

    it('defaults to utf8 decoding', async () => {
      await uploadObject(client, { bucket: 'bucket', key: 'a.txt', data: 'héllo', contentType: 'text/plain' });

      const { input } = send.mock.calls[0][0];
      expect(input.Body.toString('utf8')).toEqual('héllo');
      expect(input.ContentEncoding).toBeUndefined();
    });
  });
});
