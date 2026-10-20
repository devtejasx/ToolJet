'use strict';

// jest 27's node environment predates Node's built-in FormData/Blob, which the plugin uses at runtime
global.FormData = global.FormData || require('vm').runInThisContext('FormData');
global.Blob = global.Blob || require('buffer').Blob;

const mailgun = require('../lib');

describe('mailgun', () => {
  const service = new mailgun.default();
  const sourceOptions = { api_key: 'key', domain: 'mg.example.com', eu_hosted: false };
  const baseQuery = {
    operation: 'mail_service',
    send_mail_to: ['to@example.com'],
    send_mail_from: 'from@example.com',
    subject: 'Report',
    text: 'See attached',
  };
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ message: 'Queued' }) });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('appends each file as an attachment part', async () => {
    await service.run(sourceOptions, {
      ...baseQuery,
      attachment_array: [
        { name: 'report.pdf', type: 'application/pdf', base64Data: Buffer.from('%PDF').toString('base64') },
      ],
    });

    const form = global.fetch.mock.calls[0][1].body;
    const [attachment] = form.getAll('attachment');
    expect(attachment.name).toEqual('report.pdf');
    expect(attachment.type).toEqual('application/pdf');
    expect(Buffer.from(await attachment.arrayBuffer()).toString()).toEqual('%PDF');
  });

  it('sends no attachment parts when none are given', async () => {
    await service.run(sourceOptions, baseQuery);

    const form = global.fetch.mock.calls[0][1].body;
    expect(form.getAll('attachment')).toEqual([]);
    expect(form.get('subject')).toEqual('Report');
  });
});
