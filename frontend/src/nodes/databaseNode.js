import { BaseNode } from './BaseNode';

export const DatabaseNode = ({ id }) => {
  const fields = [
    {
      name: 'query',
      label: 'SQL Query:',
      type: 'textarea',
      defaultValue: 'SELECT * FROM users'
    }
  ];

  const handles = [
    { type: 'target', position: 'left', id: `${id}-trigger` },
    { type: 'source', position: 'right', id: `${id}-results` }
  ];

  return (
    <BaseNode
      id={id}
      title="Database"
      fields={fields}
      handles={handles}
    />
  );
};
