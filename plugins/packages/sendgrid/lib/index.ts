import { QueryError, QueryResult, QueryService } from '@tooljet-plugins/common';
import sgMail from '@sendgrid/mail';
import { EmailOptions, SourceOptions, QueryOptions, FileAttachment } from './types';

export default class SendGridQueryService implements QueryService {
  async run(sourceOptions: SourceOptions, queryOptions: QueryOptions, dataSourceId: string): Promise<QueryResult> {
    if (!(queryOptions && sourceOptions.api_key)) {
      throw new QueryError('Query could not be completed as API key is not set', 'Missing API key', {});
    }

    sgMail.setApiKey(sourceOptions.api_key);

    let result = {};

    const fromAddress =
      queryOptions.send_mail_from_name && queryOptions.send_mail_from_name.trim()
        ? { email: queryOptions.send_mail_from, name: queryOptions.send_mail_from_name.trim() }
        : queryOptions.send_mail_from;

    const sendgridEmailOptions: EmailOptions = {
      to: queryOptions.send_mail_to,
      from: fromAddress,
      subject: queryOptions.subject,
      text: queryOptions.text,
      isMultiple: queryOptions.multiple_recipients ?? false,
    };

    if (queryOptions.html && queryOptions.html.length > 0) {
      sendgridEmailOptions.html = queryOptions.html;
    }

    const attachments = parseAttachments(queryOptions.attachment_array);
    if (attachments.length > 0) {
      sendgridEmailOptions.attachments = attachments.map((file) => ({
        content: getBase64Content(file),
        filename: file.name,
        ...(file.type && { type: file.type }),
        disposition: 'attachment',
      }));
    }

    try {
      result = await sgMail.send(sendgridEmailOptions);
    } catch (error) {
      console.log(error.response);
      throw new QueryError('Query could not be completed', error.message, {});
    }

    return {
      status: 'ok',
      data: result,
    };
  }
}

// Accepts the file picker's `file` value (an array of files), a single file, or the same as a JSON string
function parseAttachments(attachments: QueryOptions['attachment_array']): FileAttachment[] {
  if (!attachments) return [];

  const parsed = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
  return (Array.isArray(parsed) ? parsed : [parsed]).filter(Boolean);
}

function getBase64Content(file: FileAttachment): string {
  const data = file.base64Data ?? file.dataURL ?? '';
  // Drop the `data:<type>;base64,` prefix if a full data URL was passed
  return data.startsWith('data:') ? data.slice(data.indexOf(',') + 1) : data;
}
