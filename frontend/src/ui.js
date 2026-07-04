// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, Panel } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { APINode } from './nodes/apiNode';
import { DatabaseNode } from './nodes/databaseNode';
import { EmailNode } from './nodes/emailNode';
import { ImageNode } from './nodes/imageNode';
import { ConditionNode } from './nodes/conditionNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  api: APINode,
  database: DatabaseNode,
  email: EmailNode,
  image: ImageNode,
  condition: ConditionNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  undo: state.undo,
  redo: state.redo,
  takeSnapshot: state.takeSnapshot,
  past: state.past,
  future: state.future,
  removeNode: state.removeNode,
  duplicateNodes: state.duplicateNodes
});

const ContextMenu = ({ menu, setMenu, duplicateNodes, removeNode }) => {
    if (!menu) return null;
    return (
        <div 
            className="context-menu" 
            style={{ top: menu.top, left: menu.left }}
        >
            <button onClick={() => { duplicateNodes(menu.id); setMenu(null); }}>Duplicate</button>
            <button className="delete" onClick={() => { removeNode(menu.id); setMenu(null); }}>Delete</button>
        </div>
    );
};

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [menu, setMenu] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      undo,
      redo,
      takeSnapshot,
      past,
      future,
      removeNode,
      duplicateNodes
    } = useStore(selector, shallow);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                duplicateNodes();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, duplicateNodes]);

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        event.stopPropagation();
        const pane = reactFlowWrapper.current.getBoundingClientRect();
        setMenu({
            id: node.id,
            top: event.clientY - pane.top,
            left: event.clientX - pane.left,
        });
    }, [setMenu]);

    const onPaneClick = useCallback(() => {
        setMenu(null);
    }, [setMenu]);

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    return (
        <>
        <div ref={reactFlowWrapper} style={{width: '100%', height: '100%', position: 'relative'}}>
            {nodes.length === 0 && (
                <div className="empty-state">
                    Drag a node from the toolbar above to get started
                    <span className="empty-state-arrow">↑</span>
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onNodeDragStart={onNodeDragStart}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={onPaneClick}
                onPaneContextMenu={(e) => { e.preventDefault(); setMenu(null); }}
                zoomOnScroll={true}
                zoomOnPinch={true}
                selectionOnDrag={true}
                panOnDrag={[1, 2]}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="#334155" variant="dots" gap={gridSize} size={1} />
                <Controls />
                <MiniMap 
                    position="top-right" 
                    style={{ backgroundColor: '#1e1e2f' }}
                    nodeColor="#6366f1"
                    maskColor="rgba(15, 17, 26, 0.7)"
                />
                <Panel position="top-left" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={undo} 
                        disabled={past.length === 0}
                        style={{ padding: '6px 12px', background: '#334155', color: past.length === 0 ? '#64748b' : '#f8fafc', border: '1px solid #475569', borderRadius: '4px', cursor: past.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        Undo
                    </button>
                    <button 
                        onClick={redo} 
                        disabled={future.length === 0}
                        style={{ padding: '6px 12px', background: '#334155', color: future.length === 0 ? '#64748b' : '#f8fafc', border: '1px solid #475569', borderRadius: '4px', cursor: future.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        Redo
                    </button>
                </Panel>
            </ReactFlow>
            <ContextMenu menu={menu} setMenu={setMenu} duplicateNodes={duplicateNodes} removeNode={removeNode} />
        </div>
        </>
    )
}
