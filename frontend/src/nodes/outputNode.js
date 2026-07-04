import { BaseNode } from './BaseNode';

export const OutputNode = ({ id }) => {
  const fields = [
    {
      name: 'outputName',
      label: 'Name:',
      type: 'text',
      defaultValue: id.replace('customOutput-', 'output_')
    },
    {
      name: 'outputType',
      label: 'Type:',
      type: 'select',
      defaultValue: 'Text',
      options: ['Text', 'Image']
    }
  ];

  const handles = [
    { type: 'target', position: 'left', id: `${id}-value` }
  ];

  return (
    <BaseNode
      id={id}
      title="Output"
      fields={fields}
      handles={handles}
    />
  );
};
