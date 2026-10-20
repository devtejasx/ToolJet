'use strict';

const { uploadObject } = require('../lib/operations');

describe('minioapi', () => {
  describe('uploadObject', () => {
    const putObject = jest.fn().mockResolvedValue({ etag: 'etag' });
    const minioClient = { putObject };

    beforeEach(() => putObject.mockClear());

    it('sends the content type as the Content-Type header, not as x-amz-meta metadata', async () => {
      await uploadObject(minioClient, {
        bucket: 'bucket',
        objectName: 'photo.png',
        data: 'iVBORw0KGgo=',
        contentType: 'image/png',
      });

      const [, , data, metaData] = putObject.mock.calls[0];
      expect(Buffer.isBuffer(data)).toBe(true);
      expect(metaData).toEqual({ 'Content-Type': 'image/png' });
    });

    it('leaves the metadata out when no content type is given', async () => {
      await uploadObject(minioClient, { bucket: 'bucket', objectName: 'notes.txt', data: 'hello' });

      expect(putObject.mock.calls[0][3]).toBeFalsy();
    });
  });
});
