import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchHCPs } from './store/hcpSlice';
import { fetchInteractions } from './store/interactionSlice';
import ChatInterface from './components/ChatInterface';
import LogForm from './components/LogForm';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div className="container">
      <div className="split-layout">
        <LogForm />
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
