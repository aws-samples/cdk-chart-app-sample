import React from 'react';
import './App.css';
import { MyChart } from './Chart';

function App() {
  return (
    <div className="App">
      <h1>AWS CDK Chart App Sample</h1>
      <MyChart deviceId="dummy"></MyChart>
    </div>
  );
}

export default App;
