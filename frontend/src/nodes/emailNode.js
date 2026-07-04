import { BaseNode } from './BaseNode';

export const EmailNode = ({ id }) => {
  const fields = [
    {
      name: 'email',
      label: 'To:',
      type: 'text',
      defaultValue: 'user@example.com'
    },
    {
      name: 'subject',
      label: 'Subject:',
      type: 'text',
      defaultValue: 'Alert'
    }
  ];

  const handles = [
    { type: 'target', position: 'left', id: `${id}-content` }
  ];

  return (
    <BaseNode
      id={id}
      title="Send Email"
      fields={fields}
      handles={handles}
    />
  );
};
