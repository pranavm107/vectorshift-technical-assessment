from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    
    # Check if the graph is a DAG
    graph = {node['id']: [] for node in pipeline.nodes}
    for edge in pipeline.edges:
        source = edge.get('source')
        target = edge.get('target')
        if source in graph:
            graph[source].append(target)
            
    is_dag = True
    visited = set()
    rec_stack = set()
    
    def is_cyclic(node_id):
        visited.add(node_id)
        rec_stack.add(node_id)
        
        for neighbor in graph.get(node_id, []):
            if neighbor not in visited:
                if is_cyclic(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
                
        rec_stack.remove(node_id)
        return False

    for node in pipeline.nodes:
        if node['id'] not in visited:
            if is_cyclic(node['id']):
                is_dag = False
                break
                
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag
    }
