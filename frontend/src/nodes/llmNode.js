import { BaseNode } from './BaseNode';

export const LLMNode = ({ id }) => {
  const handles = [
    { type: 'target', position: 'left', id: `${id}-system`, style: { top: '33%' } },
    { type: 'target', position: 'left', id: `${id}-prompt`, style: { top: '66%' } },
    { type: 'source', position: 'right', id: `${id}-response` }
  ];

  return (
    <BaseNode
      id={id}
      title="LLM"
      handles={handles}
    >
      <div style={{ padding: '8px 0', fontSize: '13px', color: '#94a3b8' }}>
        <span>Configure LLM prompts here.</span>
      </div>
    </BaseNode>
  );
};
