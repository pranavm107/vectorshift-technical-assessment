// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

let editTimeout = null;

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    past: [],
    future: [],
    takeSnapshot: () => {
        set((state) => {
            const newPast = [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-50);
            return { past: newPast, future: [] };
        });
    },
    undo: () => {
        set((state) => {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, -1);
            return {
                past: newPast,
                future: [{ nodes: state.nodes, edges: state.edges }, ...state.future],
                nodes: previous.nodes,
                edges: previous.edges
            };
        });
    },
    redo: () => {
        set((state) => {
            if (state.future.length === 0) return state;
            const next = state.future[0];
            const newFuture = state.future.slice(1);
            return {
                past: [...state.past, { nodes: state.nodes, edges: state.edges }],
                future: newFuture,
                nodes: next.nodes,
                edges: next.edges
            };
        });
    },
    removeNode: (nodeId) => {
        get().takeSnapshot();
        set({
            nodes: get().nodes.filter((n) => n.id !== nodeId),
            edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        });
    },
    duplicateNodes: (ids = null) => {
        const state = get();
        let nodesToDuplicate = [];
        
        if (typeof ids === 'string') {
            const node = state.nodes.find(n => n.id === ids);
            if (node) nodesToDuplicate.push(node);
        } else if (Array.isArray(ids)) {
            nodesToDuplicate = state.nodes.filter(n => ids.includes(n.id));
        } else {
            nodesToDuplicate = state.nodes.filter(n => n.selected);
        }

        if (nodesToDuplicate.length === 0) return;
        
        get().takeSnapshot();
        
        const updatedNodes = get().nodes.map(n => ({ ...n, selected: false }));
        
        const duplicatedNodes = nodesToDuplicate.map(node => {
            const type = node.type;
            const newId = get().getNodeID(type);
            
            return {
                ...node,
                id: newId,
                position: { x: node.position.x + 40, y: node.position.y + 40 },
                data: { ...node.data, id: newId },
                selected: true, // Auto-select the newly duplicated node
            };
        });
        
        set({ nodes: [...updatedNodes, ...duplicatedNodes] });
    },
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        get().takeSnapshot();
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      const hasRemove = changes.some(c => c.type === 'remove');
      if (hasRemove) get().takeSnapshot();
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      const hasRemove = changes.some(c => c.type === 'remove');
      if (hasRemove) get().takeSnapshot();
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      get().takeSnapshot();
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      if (!editTimeout) {
          get().takeSnapshot();
      } else {
          clearTimeout(editTimeout);
      }
      editTimeout = setTimeout(() => { editTimeout = null; }, 1000);

      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
            : node
        ),
      }));
    },
    removeEdgesForHandle: (nodeId, handleId) => {
      get().takeSnapshot();
      set({
        edges: get().edges.filter(
          (edge) =>
            !(
              (edge.source === nodeId && edge.sourceHandle === handleId) ||
              (edge.target === nodeId && edge.targetHandle === handleId)
            )
        ),
      });
    },
  }));
