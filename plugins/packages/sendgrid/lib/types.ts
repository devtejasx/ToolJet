export interface EmailOptions {
  to: string[];
  from: string | { email: string; name: string };
  subject: string;
  text: string;
  html?: string;
  isMultiple: boolean;
  attachments?: { content: string; filename: string; type?: string; disposition: string }[];
}
export type SourceOptions = {
  api_key: string;
};
export type FileAttachment = {
  name: string;
  type?: string;
  base64Data?: string;
  dataURL?: string;
};
export type QueryOptions = {
  operation: string;
  send_mail_to: string[];
  send_mail_from: string;
  send_mail_from_name?: string;
  subject: string;
  text: string;
  multiple_recipients: boolean;
  html: string;
  attachment_array?: FileAttachment[] | FileAttachment | string;
};
