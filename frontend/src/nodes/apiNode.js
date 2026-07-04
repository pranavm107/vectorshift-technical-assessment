import { BaseNode } from './BaseNode';

export const APINode = ({ id }) => {
  const fields = [
    {
      name: 'method',
      label: 'Method:',
      type: 'select',
      defaultValue: 'GET',
      options: ['GET', 'POST']
    },
    {
      name: 'endpoint',
      label: 'Endpoint:',
      type: 'text',
      defaultValue: 'https://api.example.com'
    }
  ];

  const handles = [
    { type: 'target', position: 'left', id: `${id}-trigger` },
    { type: 'source', position: 'right', id: `${id}-response` }
  ];

  return (
    <BaseNode
      id={id}
      title="API Request"
      fields={fields}
      handles={handles}
    />
  );
};
