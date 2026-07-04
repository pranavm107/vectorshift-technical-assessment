import { useState } from 'react';
import { useStore } from './store';

export const SubmitButton = () => {
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const [loading, setLoading] = useState(false);
    const [modalData, setModalData] = useState(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/pipelines/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nodes, edges })
            });

            const result = await response.json();
            
            if (response.ok) {
                setModalData(result);
            } else {
                alert(`Error: ${result.detail || 'Failed to parse pipeline'}`);
            }
        } catch (error) {
            console.error('Error submitting pipeline:', error);
            alert('Failed to connect to the backend server. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={loading}
                    style={{
                        padding: '14px 28px',
                        fontSize: '16px',
                        fontWeight: '600',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                        transition: 'all 0.2s ease',
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseOver={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99, 102, 241, 0.6)'; } }}
                    onMouseOut={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.4)'; } }}
                >
                    {loading ? 'Submitting...' : 'Submit Pipeline'}
                </button>
            </div>

            {modalData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className={`modal-title ${modalData.is_dag ? 'success' : 'error'}`}>
                            {modalData.is_dag ? '✓ Pipeline Validated' : '⚠ Pipeline Error'}
                        </h2>
                        
                        {!modalData.is_dag && (
                            <div className="modal-message">
                                This pipeline has a cycle — outputs may not be able to resolve correctly. A DAG (Directed Acyclic Graph) cannot contain loops.
                            </div>
                        )}

                        <div className="modal-stats">
                            <div className="modal-stat-card">
                                <span>Nodes</span>
                                <strong>{modalData.num_nodes}</strong>
                            </div>
                            <div className="modal-stat-card">
                                <span>Edges</span>
                                <strong>{modalData.num_edges}</strong>
                            </div>
                        </div>
                        
                        <button className="modal-close-btn" onClick={() => setModalData(null)}>
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
