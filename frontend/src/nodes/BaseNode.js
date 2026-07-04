import { useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { useStore } from '../store';

const positionMap = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const AutoResizingTextarea = ({ value, onChange, ...props }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div style={{ display: 'grid', minWidth: '180px', maxWidth: '350px' }}>
      {/* Hidden Mirror Div that determines the width of the wrapper */}
      <div
        style={{
          gridArea: '1 / 1 / 2 / 2',
          visibility: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          padding: '8px 12px',
          fontSize: '13px',
          fontFamily: 'inherit',
          width: 'fit-content',
          pointerEvents: 'none',
        }}
      >
        {value + (value?.endsWith('\n') ? ' ' : '') || ' '}
      </div>
      {/* Textarea that determines the height of the wrapper */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        style={{
          gridArea: '1 / 1 / 2 / 2',
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        {...props}
      />
    </div>
  );
};

export const BaseNode = ({ id, title, fields = [], handles = [], children }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeRef = useRef(null);

  // Selector pattern: Scoped to this node's data only to avoid global re-renders
  const nodeData = useStore(
    useCallback(
      (state) => state.nodes.find((n) => n.id === id)?.data,
      [id]
    )
  );

  // ResizeObserver to update node coordinates & redraw edges on resize
  useEffect(() => {
    if (!nodeRef.current) return;

    const observer = new ResizeObserver(() => {
      updateNodeInternals(id);
    });

    observer.observe(nodeRef.current);

    return () => {
      observer.disconnect();
    };
  }, [id, updateNodeInternals]);

  // Initialize fields in store if they are undefined
  useEffect(() => {
    fields.forEach((field) => {
      if (nodeData?.[field.name] === undefined && field.defaultValue !== undefined) {
        updateNodeField(id, field.name, field.defaultValue);
      }
    });
  }, [id, fields, nodeData, updateNodeField]);

  const hasTextarea = fields.some((f) => f.type === 'textarea');
  const baseNodeStyle = hasTextarea
    ? {
        width: 'fit-content',
        height: 'auto',
        maxWidth: '450px',
        transition: 'none', // snappy visual sizing
      }
    : {};

  return (
    <div ref={nodeRef} className={`base-node node-accent-${title.replace(/\s+/g, '')}`} style={baseNodeStyle}>
      {/* Render handles */}
      {handles.map((h) => (
        <Handle
          key={h.id}
          type={h.type}
          position={positionMap[h.position] || h.position}
          id={h.id}
          style={h.style}
        />
      ))}

      {/* Header */}
      <div className="base-node-header">
        <span className="base-node-title">{title}</span>
        <button className="base-node-delete" onClick={() => useStore.getState().removeNode(id)}>✕</button>
      </div>

      {/* Content */}
      <div className="base-node-content">
        {fields.map((field) => {
          const value = nodeData?.[field.name] ?? field.defaultValue ?? '';
          return (
            <label key={field.name}>
              {field.label}
              {field.type === 'select' ? (
                <select
                  value={value}
                  onChange={(e) => updateNodeField(id, field.name, e.target.value)}
                >
                  {field.options?.map((opt) => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    return (
                      <option key={optValue} value={optValue}>
                        {optLabel}
                      </option>
                    );
                  })}
                </select>
              ) : field.type === 'textarea' ? (
                <AutoResizingTextarea
                  value={value}
                  onChange={(e) => updateNodeField(id, field.name, e.target.value)}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={value}
                  onChange={(e) => updateNodeField(id, field.name, e.target.value)}
                />
              )}
            </label>
          );
        })}
        {children}
      </div>
    </div>
  );
};
