'use strict';

jest.mock('@sendgrid/mail', () => ({ setApiKey: jest.fn(), send: jest.fn().mockResolvedValue([{ statusCode: 202 }]) }));

const sgMail = require('@sendgrid/mail');
const sendgrid = require('../lib');

describe('sendgrid', () => {
  const service = new sendgrid.default();
  const sourceOptions = { api_key: 'key' };
  const baseQuery = {
    operation: 'mail_service',
    send_mail_to: ['to@example.com'],
    send_mail_from: 'from@example.com',
    subject: 'Report',
    text: 'See attached',
  };

  beforeEach(() => sgMail.send.mockClear());

  it('sends file picker files as attachments', async () => {
    await service.run(sourceOptions, {
      ...baseQuery,
      attachment_array: [
        { name: 'report.pdf', type: 'application/pdf', base64Data: 'JVBERi0=' },
        { name: 'notes.txt', type: 'text/plain', dataURL: 'data:text/plain;base64,aGk=' },
      ],
    });

    expect(sgMail.send.mock.calls[0][0].attachments).toEqual([
      { content: 'JVBERi0=', filename: 'report.pdf', type: 'application/pdf', disposition: 'attachment' },
      { content: 'aGk=', filename: 'notes.txt', type: 'text/plain', disposition: 'attachment' },
    ]);
  });

  it('accepts a single file passed as a JSON string', async () => {
    await service.run(sourceOptions, {
      ...baseQuery,
      attachment_array: JSON.stringify({ name: 'a.csv', base64Data: 'YSxi' }),
    });

    expect(sgMail.send.mock.calls[0][0].attachments).toEqual([
      { content: 'YSxi', filename: 'a.csv', disposition: 'attachment' },
    ]);
  });

  it('sends no attachments key when none are given', async () => {
    await service.run(sourceOptions, baseQuery);

    expect(sgMail.send.mock.calls[0][0]).not.toHaveProperty('attachments');
  });
});
