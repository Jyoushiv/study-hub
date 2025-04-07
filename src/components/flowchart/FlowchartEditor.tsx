'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPosition: Position;
  toPosition: Position;
}

interface FlowchartBlock {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'input' | 'output';
  text: string;
  position: Position;
  width: number;
  height: number;
}

const FlowchartEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<FlowchartBlock[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [nextId, setNextId] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load saved flowchart data from localStorage on component mount
  useEffect(() => {
    const savedBlocks = localStorage.getItem('flowchartBlocks');
    const savedConnections = localStorage.getItem('flowchartConnections');
    const savedNextId = localStorage.getItem('flowchartNextId');
    
    if (savedBlocks) {
      setBlocks(JSON.parse(savedBlocks));
    }
    
    if (savedConnections) {
      setConnections(JSON.parse(savedConnections));
    }
    
    if (savedNextId) {
      setNextId(JSON.parse(savedNextId));
    }
  }, []);
  
  // Save flowchart data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('flowchartBlocks', JSON.stringify(blocks));
    localStorage.setItem('flowchartConnections', JSON.stringify(connections));
    localStorage.setItem('flowchartNextId', JSON.stringify(nextId));
  }, [blocks, connections, nextId]);
  
  // Generate a unique ID for new blocks
  const generateId = () => {
    const id = `block-${nextId}`;
    setNextId(nextId + 1);
    return id;
  };
  
  // Add a new block to the flowchart
  const addBlock = (type: FlowchartBlock['type']) => {
    const id = generateId();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;
    
    // Default dimensions based on block type
    let width = 150;
    let height = 60;
    
    if (type === 'decision') {
      width = 120;
      height = 120;
    } else if (type === 'start' || type === 'end') {
      width = 120;
      height = 50;
    }
    
    // Position the new block in the center of the container
    const newBlock: FlowchartBlock = {
      id,
      type,
      text: getDefaultText(type),
      position: {
        x: (containerRect.width / 2) - (width / 2),
        y: (containerRect.height / 2) - (height / 2),
      },
      width,
      height,
    };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(id);
    setEditingText(id);
    setEditText(newBlock.text);
  };
  
  // Get default text based on block type
  const getDefaultText = (type: FlowchartBlock['type']): string => {
    switch (type) {
      case 'start': return 'Start';
      case 'end': return 'End';
      case 'decision': return 'Decision?';
      case 'process': return 'Process';
      case 'input': return 'Input';
      case 'output': return 'Output';
      default: return 'New Block';
    }
  };
  
  // Handle mouse down on a block
  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    
    // Select the block
    setSelectedBlock(blockId);
    
    // Start dragging
    setDraggingBlock(blockId);
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    // Calculate the offset between mouse position and block position
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const offsetX = e.clientX - containerRect.left - block.position.x;
    const offsetY = e.clientY - containerRect.top - block.position.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
  };
  
  // Handle mouse move for dragging blocks
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingBlock) {
      // Handle drawing connection line if connecting
      if (connectingFrom) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        
        // Update the temporary connection line
        const fromBlock = blocks.find(b => b.id === connectingFrom);
        if (!fromBlock) return;
        
        // Force re-render to update the temporary connection line
        setConnections([...connections]);
      }
      return;
    }
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    // Calculate new position
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Update block position
    setBlocks(blocks.map(block => {
      if (block.id === draggingBlock) {
        return {
          ...block,
          position: { x: newX, y: newY }
        };
      }
      return block;
    }));
    
    // Update connections
    setConnections(connections.map(conn => {
      if (conn.from === draggingBlock) {
        return {
          ...conn,
          fromPosition: getConnectionPoint(draggingBlock, conn.to, 'from')
        };
      }
      if (conn.to === draggingBlock) {
        return {
          ...conn,
          toPosition: getConnectionPoint(conn.from, draggingBlock, 'to')
        };
      }
      return conn;
    }));
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggingBlock(null);
    
    // If connecting, check if mouse is over a block
    if (connectingFrom) {
      setConnectingFrom(null);
    }
  };
  
  // Handle click on the container (background)
  const handleContainerClick = () => {
    setSelectedBlock(null);
    setEditingText(null);
  };
  
  // Start creating a connection from a block
  const startConnection = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setConnectingFrom(blockId);
  };
  
  // Complete a connection to another block
  const completeConnection = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    
    if (!connectingFrom || connectingFrom === blockId) {
      return;
    }
    
    // Check if connection already exists
    const connectionExists = connections.some(
      conn => conn.from === connectingFrom && conn.to === blockId
    );
    
    if (!connectionExists) {
      const fromPosition = getConnectionPoint(connectingFrom, blockId, 'from');
      const toPosition = getConnectionPoint(connectingFrom, blockId, 'to');
      
      const newConnection: Connection = {
        id: `conn-${connectingFrom}-${blockId}`,
        from: connectingFrom,
        to: blockId,
        fromPosition,
        toPosition
      };
      
      setConnections([...connections, newConnection]);
    }
    
    setConnectingFrom(null);
  };
  
  // Calculate connection points between blocks
  const getConnectionPoint = (fromId: string, toId: string, pointType: 'from' | 'to'): Position => {
    const fromBlock = blocks.find(b => b.id === fromId);
    const toBlock = blocks.find(b => b.id === toId);
    
    if (!fromBlock || !toBlock) {
      return { x: 0, y: 0 };
    }
    
    // Calculate center points
    const fromCenter = {
      x: fromBlock.position.x + fromBlock.width / 2,
      y: fromBlock.position.y + fromBlock.height / 2
    };
    
    const toCenter = {
      x: toBlock.position.x + toBlock.width / 2,
      y: toBlock.position.y + toBlock.height / 2
    };
    
    // Determine which side of the block to connect from/to
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    
    const block = pointType === 'from' ? fromBlock : toBlock;
    const center = pointType === 'from' ? fromCenter : toCenter;
    
    // Determine which side to connect to based on angle
    const angle = Math.atan2(dy, dx);
    const halfWidth = block.width / 2;
    const halfHeight = block.height / 2;
    
    // Adjust for diamond shape if it's a decision block
    if (block.type === 'decision') {
      // For diamond shape, we need to calculate intersection with the diamond edges
      const slope = Math.abs(dy / dx);
      
      if (slope > halfHeight / halfWidth) {
        // Connect to top or bottom
        const y = center.y + (dy > 0 ? halfHeight : -halfHeight);
        const x = center.x + (halfHeight / slope) * (dx > 0 ? 1 : -1);
        return { x, y };
      } else {
        // Connect to left or right
        const x = center.x + (dx > 0 ? halfWidth : -halfWidth);
        const y = center.y + (slope * halfWidth) * (dy > 0 ? 1 : -1);
        return { x, y };
      }
    }
    
    // For rectangular blocks
    if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > (3 * Math.PI) / 4) {
      // Connect to left or right
      const x = center.x + (dx > 0 ? halfWidth : -halfWidth);
      const y = center.y;
      return { x, y };
    } else {
      // Connect to top or bottom
      const x = center.x;
      const y = center.y + (dy > 0 ? halfHeight : -halfHeight);
      return { x, y };
    }
  };
  
  // Delete a block and its connections
  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    setConnections(connections.filter(conn => conn.from !== blockId && conn.to !== blockId));
    setSelectedBlock(null);
    setEditingText(null);
  };
  
  // Delete a connection
  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };
  
  // Start editing block text
  const startEditingText = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    setEditingText(blockId);
    setEditText(block.text);
  };
  
  // Save edited text
  const saveEditedText = () => {
    if (!editingText) return;
    
    setBlocks(blocks.map(block => {
      if (block.id === editingText) {
        return {
          ...block,
          text: editText
        };
      }
      return block;
    }));
    
    setEditingText(null);
  };
  
  // Handle key press in text editor
  const handleTextKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditedText();
    }
  };
  
  // Clear the flowchart
  const clearFlowchart = () => {
    if (window.confirm('Are you sure you want to clear the flowchart? This action cannot be undone.')) {
      setBlocks([]);
      setConnections([]);
      setSelectedBlock(null);
      setEditingText(null);
    }
  };
  
  // Export flowchart as JSON
  const exportFlowchart = () => {
    const data = {
      blocks,
      connections
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import flowchart from JSON
  const importFlowchart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.blocks && Array.isArray(data.blocks) && 
            data.connections && Array.isArray(data.connections)) {
          setBlocks(data.blocks);
          setConnections(data.connections);
          
          // Update nextId to be greater than any existing id
          const maxId = data.blocks.reduce((max: number, block: FlowchartBlock) => {
            const idNum = parseInt(block.id.replace('block-', ''));
            return Math.max(max, idNum);
          }, 0);
          
          setNextId(maxId + 1);
        } else {
          alert('Invalid flowchart data format');
        }
      } catch (error) {
        alert('Error importing flowchart: ' + error);
      }
    };
    
    reader.readAsText(file);
    
    // Reset the input value to allow importing the same file again
    e.target.value = '';
  };
  
  // Render a block based on its type
  const renderBlock = (block: FlowchartBlock) => {
    const isSelected = selectedBlock === block.id;
    const isEditing = editingText === block.id;
    
    let blockShape;
    
    switch (block.type) {
      case 'start':
      case 'end':
        // Rounded rectangle
        blockShape = (
          <div 
            className={`absolute rounded-full flex items-center justify-center p-2 ${
              block.type === 'start' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
            } ${isSelected ? 'border-2' : 'border'}`}
            style={{
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              width: `${block.width}px`,
              height: `${block.height}px`,
              cursor: 'move',
              zIndex: isSelected ? 10 : 1
            }}
            onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
            onDoubleClick={(e) => startEditingText(e, block.id)}
          >
            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={handleTextKeyPress}
                onBlur={saveEditedText}
                className="w-full text-center bg-transparent outline-none"
                autoFocus
              />
            ) : (
              <div className="text-center">{block.text}</div>
            )}
          </div>
        );
        break;
        
      case 'decision':
        // Diamond shape
        blockShape = (
          <div 
            className={`absolute flex items-center justify-center ${
              isSelected ? 'border-2 border-blue-500' : 'border border-gray-400'
            }`}
            style={{
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              width: `${block.width}px`,
              height: `${block.height}px`,
              transform: 'rotate(45deg)',
              backgroundColor: 'rgb(254, 240, 138)',
              cursor: 'move',
              zIndex: isSelected ? 10 : 1
            }}
            onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
          >
            <div 
              style={{ transform: 'rotate(-45deg)', width: '100%', height: '100%' }}
              className="flex items-center justify-center"
              onDoubleClick={(e) => startEditingText(e, block.id)}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={handleTextKeyPress}
                  onBlur={saveEditedText}
                  className="w-3/4 text-center bg-transparent outline-none"
                  autoFocus
                />
              ) : (
                <div className="text-center p-2">{block.text}</div>
              )}
            </div>
          </div>
        );
        break;
        
      case 'input':
      case 'output':
        // Parallelogram
        const skewValue = block.type === 'input' ? 'skew(20deg)' : 'skew(-20deg)';
        blockShape = (
          <div 
            className={`absolute flex items-center justify-center ${
              isSelected ? 'border-2 border-blue-500' : 'border border-gray-400'
            }`}
            style={{
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              width: `${block.width}px`,
              height: `${block.height}px`,
              transform: skewValue,
              backgroundColor: block.type === 'input' ? 'rgb(219, 234, 254)' : 'rgb(254, 226, 226)',
              cursor: 'move',
              zIndex: isSelected ? 10 : 1
            }}
            onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
          >
            <div 
              style={{ transform: block.type === 'input' ? 'skew(-20deg)' : 'skew(20deg)' }}
              className="flex items-center justify-center w-full h-full"
              onDoubleClick={(e) => startEditingText(e, block.id)}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={handleTextKeyPress}
                  onBlur={saveEditedText}
                  className="w-3/4 text-center bg-transparent outline-none"
                  autoFocus
                />
              ) : (
                <div className="text-center p-2">{block.text}</div>
              )}
            </div>
          </div>
        );
        break;
        
      case 'process':
      default:
        // Rectangle
        blockShape = (
          <div 
            className={`absolute flex items-center justify-center p-2 bg-white ${
              isSelected ? 'border-2 border-blue-500' : 'border border-gray-400'
            }`}
            style={{
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              width: `${block.width}px`,
              height: `${block.height}px`,
              cursor: 'move',
              zIndex: isSelected ? 10 : 1
            }}
            onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
            onDoubleClick={(e) => startEditingText(e, block.id)}
          >
            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={handleTextKeyPress}
                onBlur={saveEditedText}
                className="w-full text-center bg-transparent outline-none"
                autoFocus
              />
            ) : (
              <div className="text-center">{block.text}</div>
            )}
          </div>
        );
    }
    
    // Connection points
    const connectionPoints = (
      <>
        {/* Top connection point */}
        <div 
          className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-0 hover:opacity-50 cursor-pointer"
          style={{
            left: `${block.position.x + block.width / 2 - 3}px`,
            top: `${block.position.y - 3}px`,
            zIndex: 20
          }}
          onMouseDown={(e) => startConnection(e, block.id)}
          onMouseUp={(e) => completeConnection(e, block.id)}
        />
        
        {/* Right connection point */}
        <div 
          className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-0 hover:opacity-50 cursor-pointer"
          style={{
            left: `${block.position.x + block.width - 3}px`,
            top: `${block.position.y + block.height / 2 - 3}px`,
            zIndex: 20
          }}
          onMouseDown={(e) => startConnection(e, block.id)}
          onMouseUp={(e) => completeConnection(e, block.id)}
        />
        
        {/* Bottom connection point */}
        <div 
          className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-0 hover:opacity-50 cursor-pointer"
          style={{
            left: `${block.position.x + block.width / 2 - 3}px`,
            top: `${block.position.y + block.height - 3}px`,
            zIndex: 20
          }}
          onMouseDown={(e) => startConnection(e, block.id)}
          onMouseUp={(e) => completeConnection(e, block.id)}
        />
        
        {/* Left connection point */}
        <div 
          className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-0 hover:opacity-50 cursor-pointer"
          style={{
            left: `${block.position.x - 3}px`,
            top: `${block.position.y + block.height / 2 - 3}px`,
            zIndex: 20
          }}
          onMouseDown={(e) => startConnection(e, block.id)}
          onMouseUp={(e) => completeConnection(e, block.id)}
        />
      </>
    );
    
    return (
      <React.Fragment key={block.id}>
        {blockShape}
        {isSelected && connectionPoints}
      </React.Fragment>
    );
  };
  
  // Render connections between blocks
  const renderConnections = () => {
    return connections.map(connection => {
      const { fromPosition, toPosition } = connection;
      
      // Calculate the midpoint for the arrow
      const midX = (fromPosition.x + toPosition.x) / 2;
      const midY = (fromPosition.y + toPosition.y) / 2;
      
      // Calculate the angle for the arrowhead
      const angle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x);
      
      // Arrowhead points
      const arrowSize = 10;
      const arrowPoint1 = {
        x: midX - arrowSize * Math.cos(angle - Math.PI / 6),
        y: midY - arrowSize * Math.sin(angle - Math.PI / 6)
      };
      const arrowPoint2 = {
        x: midX - arrowSize * Math.cos(angle + Math.PI / 6),
        y: midY - arrowSize * Math.sin(angle + Math.PI / 6)
      };
      
      return (
        <g key={connection.id}>
          {/* Connection line */}
          <line
            x1={fromPosition.x}
            y1={fromPosition.y}
            x2={toPosition.x}
            y2={toPosition.y}
            stroke="black"
            strokeWidth="2"
            markerMid="url(#arrowhead)"
            onClick={() => deleteConnection(connection.id)}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Arrowhead */}
          <polygon
            points={`${midX},${midY} ${arrowPoint1.x},${arrowPoint1.y} ${arrowPoint2.x},${arrowPoint2.y}`}
            fill="black"
            onClick={() => deleteConnection(connection.id)}
            style={{ cursor: 'pointer' }}
          />
        </g>
      );
    });
  };
  
  // Render temporary connection line when creating a connection
  const renderTemporaryConnection = () => {
    if (!connectingFrom) return null;
    
    const fromBlock = blocks.find(b => b.id === connectingFrom);
    if (!fromBlock) return null;
    
    const fromCenter = {
      x: fromBlock.position.x + fromBlock.width / 2,
      y: fromBlock.position.y + fromBlock.height / 2
    };
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return null;
    
    // Get mouse position relative to container
    const mouseX = 0; // This will be updated in handleMouseMove
    const mouseY = 0; // This will be updated in handleMouseMove
    
    return (
      <line
        x1={fromCenter.x}
        y1={fromCenter.y}
        x2={mouseX}
        y2={mouseY}
        stroke="gray"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
  };
  
  return (
    <div className="flowchart-editor-container p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="toolbar flex flex-wrap gap-2 mb-4">
        <div className="block-types flex flex-wrap gap-2">
          <button 
            onClick={() => addBlock('start')}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start
          </button>
          <button 
            onClick={() => addBlock('process')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Process
          </button>
          <button 
            onClick={() => addBlock('decision')}
            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Decision
          </button>
          <button 
            onClick={() => addBlock('input')}
            className="px-3 py-2 bg-blue-300 text-white rounded hover:bg-blue-400"
          >
            Input
          </button>
          <button 
            onClick={() => addBlock('output')}
            className="px-3 py-2 bg-red-300 text-white rounded hover:bg-red-400"
          >
            Output
          </button>
          <button 
            onClick={() => addBlock('end')}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End
          </button>
        </div>
        
        <div className="actions flex flex-wrap gap-2 ml-auto">
          {selectedBlock && (
            <button 
              onClick={() => deleteBlock(selectedBlock)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Block
            </button>
          )}
          <button 
            onClick={clearFlowchart}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear All
          </button>
          <button 
            onClick={exportFlowchart}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Export
          </button>
          <label className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 cursor-pointer">
            Import
            <input 
              type="file" 
              accept=".json" 
              onChange={importFlowchart} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flowchart-container relative border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg"
        style={{ height: '600px', overflow: 'hidden' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleContainerClick}
      >
        {/* SVG layer for connections */}
        <svg 
          width="100%" 
          height="100%" 
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="10" 
              markerHeight="7" 
              refX="0" 
              refY="3.5" 
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>
          {renderConnections()}
          {renderTemporaryConnection()}
        </svg>
        
        {/* Blocks layer */}
        {blocks.map(renderBlock)}
      </div>
      
      <div className="instructions mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Double-click on a block to edit its text. Drag from connection points to create connections between blocks.</p>
      </div>
    </div>
  );
};

export default FlowchartEditor;
