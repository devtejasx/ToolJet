import React from 'react';
import { escapeRegExp } from 'lodash';

export const HighLightSearch = React.memo(({ text, searchTerm }) => {
  if (text === '') return null;

  if (searchTerm === '' || !text.toString()?.toLowerCase().includes(searchTerm?.toLowerCase()))
    return <span>{text}</span>;

  const parts = String(text).split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) =>
        part?.toLowerCase() === searchTerm?.toLowerCase() ? (
          <span key={index}>
            <mark>{part}</mark>
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
});
