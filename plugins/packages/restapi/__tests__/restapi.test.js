'use strict';

const restapi = require('../lib');

describe('restapi', () => {
  describe('binary responses', () => {
    const service = new restapi.default();
    const bytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0xff, 0xfe, 0x00, 0x80]);
    const responseWith = (contentType) => ({
      headers: { 'content-type': contentType },
      body: bytes.toString('utf8'),
      rawBody: bytes,
    });

    it.each([
      'application/pdf',
      'application/pdf; charset=binary',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'Application/ZIP',
      'image/png',
    ])('returns %s bodies as lossless base64', (contentType) => {
      const result = service.getResponse(responseWith(contentType));

      expect(Buffer.from(result, 'base64')).toEqual(bytes);
    });

    it('keeps text bodies as text', () => {
      const response = {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        body: 'hello',
        rawBody: Buffer.from('hello'),
      };

      expect(service.getResponse(response)).toEqual('hello');
    });

    it('still parses JSON bodies', () => {
      const response = {
        headers: { 'content-type': 'application/json' },
        body: '{"a":1}',
        rawBody: Buffer.from('{"a":1}'),
      };

      expect(service.getResponse(response)).toEqual({ a: 1 });
    });
  });
});
