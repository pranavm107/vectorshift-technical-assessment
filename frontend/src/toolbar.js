// toolbar.js

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
    return (
        <div style={{ 
            padding: '16px 24px', 
            background: '#1e1e24', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: '18px'
                }}>
                    V
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>VectorShift</h1>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Pipeline Builder</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <DraggableNode type='customInput' label='Input' description='Creates a pipeline input variable' />
                <DraggableNode type='llm' label='LLM' description='Queries a Large Language Model' />
                <DraggableNode type='customOutput' label='Output' description='Defines a pipeline output' />
                <DraggableNode type='text' label='Text' description='Defines a text block with template variables' />
                <DraggableNode type='api' label='API' description='Calls an external web service' />
                <DraggableNode type='database' label='DB' description='Reads or writes to a database' />
                <DraggableNode type='email' label='Email' description='Sends an email notification' />
                <DraggableNode type='image' label='Image' description='Generates an image from text' />
                <DraggableNode type='condition' label='Cond' description='Branches the pipeline based on a condition' />
            </div>
        </div>
    );
};
