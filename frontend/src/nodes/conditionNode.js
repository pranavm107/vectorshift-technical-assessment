import { BaseNode } from './BaseNode';

export const ConditionNode = ({ id }) => {
  const fields = [
    {
      name: 'operator',
      label: 'Operator:',
      type: 'select',
      defaultValue: '==',
      options: ['==', '!=', '>', '<']
    }
  ];

  const handles = [
    { type: 'target', position: 'left', id: `${id}-input1`, style: { top: '33%' } },
    { type: 'target', position: 'left', id: `${id}-input2`, style: { top: '66%' } },
    { type: 'source', position: 'right', id: `${id}-true`, style: { top: '33%', background: '#4ade80' } },
    { type: 'source', position: 'right', id: `${id}-false`, style: { top: '66%', background: '#f87171' } }
  ];

  return (
    <BaseNode
      id={id}
      title="Condition"
      fields={fields}
      handles={handles}
    />
  );
};
