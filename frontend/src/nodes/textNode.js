import { useEffect, useRef } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TextNode = ({ id }) => {
  const text = useStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.text ?? '{{input}}'
  );

  const updateNodeInternals = useUpdateNodeInternals();
  const removeEdgesForHandle = useStore((state) => state.removeEdgesForHandle);
  const prevHandleIdsRef = useRef([]);

  // Extract variables (e.g. {{variable}}) from the text
  const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
  const matches = [...text.matchAll(regex)];
  const variables = [...new Set(matches.map(m => m[1]))];

  const handles = [
    { type: 'source', position: 'right', id: `${id}-output` },
    ...variables.map((v, i) => ({
      type: 'target',
      position: 'left',
      id: `${id}-var-${v}`,
      style: { top: `${(i + 1) * (100 / (variables.length + 1))}%` }
    }))
  ];

  const currentHandleIds = handles.map(h => h.id);

  useEffect(() => {
    const prevHandleIds = prevHandleIdsRef.current;
    const disappeared = prevHandleIds.filter(hid => !currentHandleIds.includes(hid));
    disappeared.forEach(handleId => removeEdgesForHandle(id, handleId));
    prevHandleIdsRef.current = currentHandleIds;
  }, [currentHandleIds.join(','), id, removeEdgesForHandle]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [variables.join(','), id, updateNodeInternals]);

  const fields = [
    {
      name: 'text',
      label: 'Text:',
      type: 'textarea',
      defaultValue: '{{input}}'
    }
  ];

  return (
    <BaseNode
      id={id}
      title="Text"
      fields={fields}
      handles={handles}
    />
  );
};
