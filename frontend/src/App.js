import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f111a', fontFamily: 'Inter, sans-serif' }}>
      <PipelineToolbar />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <PipelineUI />
        <SubmitButton />
      </div>
    </div>
  );
}

export default App;
