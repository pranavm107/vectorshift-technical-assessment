import { BaseNode } from './BaseNode';

export const ImageNode = ({ id }) => {
  const fields = [
    {
      name: 'resolution',
      label: 'Resolution:',
      type: 'select',
      defaultValue: '1024x1024',
      options: ['512x512', '1024x1024']
    }
  ];

  const handles = [
    { type: 'target', position: 'left', id: `${id}-prompt` },
    { type: 'source', position: 'right', id: `${id}-image` }
  ];

  return (
    <BaseNode
      id={id}
      title="Image Generation"
      fields={fields}
      handles={handles}
    />
  );
};
