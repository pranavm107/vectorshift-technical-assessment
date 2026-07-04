import { BaseNode } from './BaseNode';

export const InputNode = ({ id }) => {
  const fields = [
    {
      name: 'inputName',
      label: 'Name:',
      type: 'text',
      defaultValue: id.replace('customInput-', 'input_')
    },
    {
      name: 'inputType',
      label: 'Type:',
      type: 'select',
      defaultValue: 'Text',
      options: ['Text', 'File']
    }
  ];

  const handles = [
    { type: 'source', position: 'right', id: `${id}-value` }
  ];

  return (
    <BaseNode
      id={id}
      title="Input"
      fields={fields}
      handles={handles}
    />
  );
};
