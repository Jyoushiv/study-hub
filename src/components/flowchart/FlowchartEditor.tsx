'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Node {
  id: string;
  type: 'solid' | 'dashed';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'solid' | 'dashed';
}

const FlowchartEditor: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [currentColor, setCurrentColor] = useState('#FFD6D6'); // Light pink default
  const [currentType, setCurrentType] = useState<'solid' | 'dashed'>('solid');
  const [connectionType, setConnectionType] = useState<'solid' | 'dashed'>('solid');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load saved flowchart from localStorage on component mount
  useEffect(() => {
    const savedFlowchart = localStorage.getItem('productivityHubFlowchart');
    if (savedFlowchart) {
      try {
        const { nodes: savedNodes, connections: savedConnections } = JSON.parse(savedFlowchart);
        setNodes(savedNodes);
        setConnections(savedConnections);
      } catch (error) {
        console.error('Failed to load saved flowchart:', error);
      }
    }
  }, []);

  const addNode = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 75; // Center the node on click
    const y = e.clientY - rect.top - 40;
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: currentType,
      text: 'New Node',
      x,
      y,
      width: 150,
      height: 80,
      color: currentColor,
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
    setEditingText(newNode.id);
    setEditText('New Node');
  };

  const startDragging = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      
      setNodes(nodes.map(node => 
        node.id === draggingNode 
          ? { ...node, x, y } 
          : node
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const startConnecting = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };

  const completeConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== nodeId) {
      // Check if connection already exists
      const connectionExists = connections.some(
        conn => (conn.from === connectingFrom && conn.to === nodeId) || 
                (conn.from === nodeId && conn.to === connectingFrom)
      );
      
      if (!connectionExists) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: nodeId,
          type: connectionType
        };
        setConnections([...connections, newConnection]);
      }
    }
    setConnectingFrom(null);
  };

  const selectNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom) {
      completeConnection(e, nodeId);
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
    }
  };

  const selectConnection = (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation();
    setSelectedConnection(connectionId);
    setSelectedNode(null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    setSelectedNode(null);
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    setSelectedConnection(null);
  };

  const startEditing = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingText(nodeId);
      setEditText(node.text);
    }
  };

  const saveText = () => {
    if (editingText) {
      setNodes(nodes.map(node => 
        node.id === editingText 
          ? { ...node, text: editText } 
          : node
      ));
      setEditingText(null);
    }
  };

  const changeNodeColor = (nodeId: string, color: string) => {
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, color } 
        : node
    ));
  };

  const changeNodeType = (nodeId: string, type: 'solid' | 'dashed') => {
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, type } 
        : node
    ));
  };

  const changeConnectionType = (connectionId: string, type: 'solid' | 'dashed') => {
    setConnections(connections.map(conn => 
      conn.id === connectionId 
        ? { ...conn, type } 
        : conn
    ));
  };

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      setNodes([]);
      setConnections([]);
      setSelectedNode(null);
      setSelectedConnection(null);
    }
  };

  const saveFlowchart = () => {
    try {
      localStorage.setItem('productivityHubFlowchart', JSON.stringify({ nodes, connections }));
      toast({
        title: "Flowchart saved",
        description: "Your flowchart has been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save flowchart:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your flowchart.",
        variant: "destructive",
      });
    }
  };

  const exportFlowchart = () => {
    try {
      const data = JSON.stringify({ nodes, connections }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowchart.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Flowchart exported",
        description: "Your flowchart has been exported as JSON.",
      });
    } catch (error) {
      console.error('Failed to export flowchart:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your flowchart.",
        variant: "destructive",
      });
    }
  };

  const importFlowchart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { nodes: importedNodes, connections: importedConnections } = JSON.parse(content);
        setNodes(importedNodes);
        setConnections(importedConnections);
        toast({
          title: "Flowchart imported",
          description: "Your flowchart has been imported successfully.",
        });
      } catch (error) {
        console.error('Failed to import flowchart:', error);
        toast({
          title: "Import failed",
          description: "There was an error importing your flowchart.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      setSelectedConnection(null);
      setEditingText(null);
      
      if (e.ctrlKey || e.metaKey) {
        addNode(e);
      }
    }
  };

  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return null;
      
      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height / 2;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y + toNode.height / 2;
      
      // Calculate arrow points
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      
      // Adjust start and end points to be on the edge of nodes
      const fromNodeAngle = Math.atan2(toY - fromY, toX - fromX);
      const toNodeAngle = Math.atan2(fromY - toY, fromX - toX);
      
      const fromRadius = Math.min(fromNode.width, fromNode.height) / 2;
      const toRadius = Math.min(toNode.width, toNode.height) / 2;
      
      const adjustedFromX = fromX + Math.cos(fromNodeAngle) * fromRadius;
      const adjustedFromY = fromY + Math.sin(fromNodeAngle) * fromRadius;
      const adjustedToX = toX + Math.cos(toNodeAngle) * toRadius;
      const adjustedToY = toY + Math.sin(toNodeAngle) * toRadius;
      
      // Arrow head
      const arrowLength = 10;
      const arrowWidth = 5;
      const arrowX1 = adjustedToX - arrowLength * Math.cos(angle - Math.PI / 6);
      const arrowY1 = adjustedToY - arrowLength * Math.sin(angle - Math.PI / 6);
      const arrowX2 = adjustedToX - arrowLength * Math.cos(angle + Math.PI / 6);
      const arrowY2 = adjustedToY - arrowLength * Math.sin(angle + Math.PI / 6);
      
      const isSelected = selectedConnection === conn.id;
      const strokeStyle = conn.type === 'dashed' ? '5,5' : '';
      
      return (
        <g key={conn.id} onClick={(e) => selectConnection(e, conn.id)}>
          <line
            x1={adjustedFromX}
            y1={adjustedFromY}
            x2={adjustedToX}
            y2={adjustedToY}
            stroke={isSelected ? '#ff6b6b' : '#0066cc'}
            strokeWidth={isSelected ? 3 : 2}
            strokeDasharray={strokeStyle}
            style={{ cursor: 'pointer' }}
          />
          <polygon
            points={`${adjustedToX},${adjustedToY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
            fill={isSelected ? '#ff6b6b' : '#0066cc'}
          />
          {isSelected && (
            <foreignObject
              x={(adjustedFromX + adjustedToX) / 2 - 15}
              y={(adjustedFromY + adjustedToY) / 2 - 15}
              width="30"
              height="30"
            >
              <div
                className="flex items-center justify-center bg-red-500 text-white rounded-full w-6 h-6 cursor-pointer"
                onClick={() => deleteConnection(conn.id)}
              >
                <X size={14} />
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  };

  const renderNodes = () => {
    return nodes.map(node => {
      const isSelected = selectedNode === node.id;
      const isEditing = editingText === node.id;
      
      const borderStyle = node.type === 'dashed' ? '5,5' : '';
      const nodeStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        backgroundColor: node.color,
        border: `2px ${node.type === 'dashed' ? 'dashed' : 'solid'} ${isSelected ? '#ff6b6b' : '#333'}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        padding: '8px',
        boxShadow: isSelected ? '0 0 0 2px rgba(255, 107, 107, 0.5)' : 'none',
        zIndex: isSelected ? 10 : 1
      };
      
      return (
        <div
          key={node.id}
          style={nodeStyle}
          onClick={(e) => selectNode(e, node.id)}
          onMouseDown={(e) => startDragging(e, node.id)}
          onDoubleClick={() => startEditing(node.id)}
        >
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={saveText}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveText();
                }
              }}
              autoFocus
              className="w-full h-full bg-transparent border-none resize-none text-center focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="text-center w-full break-words">{node.text}</div>
          )}
          
          {isSelected && !isEditing && (
            <>
              <div
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                onClick={() => deleteNode(node.id)}
              >
                <X size={14} />
              </div>
              <div
                className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                onClick={(e) => startConnecting(e, node.id)}
              >
                <Plus size={14} />
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 p-2 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Node Style:</span>
          <Button
            variant={currentType === 'solid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentType('solid')}
            className="h-8"
          >
            Solid
          </Button>
          <Button
            variant={currentType === 'dashed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentType('dashed')}
            className="h-8"
          >
            Dashed
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Connection:</span>
          <Button
            variant={connectionType === 'solid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionType('solid')}
            className="h-8"
          >
            Solid
          </Button>
          <Button
            variant={connectionType === 'dashed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionType('dashed')}
            className="h-8"
          >
            Dashed
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Color:</span>
          <div className="flex space-x-1">
            {['#FFD6D6', '#D6FFD6', '#D6D6FF', '#FFFFD6', '#FFD6FF', '#D6FFFF', '#FFFFFF'].map(color => (
              <div
                key={color}
                className={`w-6 h-6 rounded-full cursor-pointer ${currentColor === color ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={saveFlowchart} className="h-8">
            <Save size={16} className="mr-1" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={exportFlowchart} className="h-8">
            <Download size={16} className="mr-1" /> Export
          </Button>
          <label className="cursor-pointer">
            <Button size="sm" variant="outline" className="h-8" asChild>
              <span>Import</span>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importFlowchart}
            />
          </label>
          <Button size="sm" variant="destructive" onClick={clearCanvas} className="h-8">
            <Trash2 size={16} className="mr-1" /> Clear
          </Button>
        </div>
      </div>
      
      {selectedNode && (
        <Card className="m-2 p-2">
          <div className="text-sm">
            <div className="font-medium">Node Properties</div>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="flex items-center space-x-2">
                <span>Style:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeNodeType(selectedNode, 'solid')}
                  className={`h-7 ${nodes.find(n => n.id === selectedNode)?.type === 'solid' ? 'bg-blue-100' : ''}`}
                >
                  Solid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeNodeType(selectedNode, 'dashed')}
                  className={`h-7 ${nodes.find(n => n.id === selectedNode)?.type === 'dashed' ? 'bg-blue-100' : ''}`}
                >
                  Dashed
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span>Color:</span>
                <div className="flex space-x-1">
                  {['#FFD6D6', '#D6FFD6', '#D6D6FF', '#FFFFD6', '#FFD6FF', '#D6FFFF', '#FFFFFF'].map(color => (
                    <div
                      key={color}
                      className={`w-5 h-5 rounded-full cursor-pointer ${nodes.find(n => n.id === selectedNode)?.color === color ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => changeNodeColor(selectedNode, color)}
                    />
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startEditing(selectedNode)}
                className="h-7"
              >
                Edit Text
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {selectedConnection && (
        <Card className="m-2 p-2">
          <div className="text-sm">
            <div className="font-medium">Connection Properties</div>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="flex items-center space-x-2">
                <span>Style:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeConnectionType(selectedConnection, 'solid')}
                  className={`h-7 ${connections.find(c => c.id === selectedConnection)?.type === 'solid' ? 'bg-blue-100' : ''}`}
                >
                  Solid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeConnectionType(selectedConnection, 'dashed')}
                  className={`h-7 ${connections.find(c => c.id === selectedConnection)?.type === 'dashed' ? 'bg-blue-100' : ''}`}
                >
                  Dashed
                </Button>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteConnection(selectedConnection)}
                className="h-7"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="flex-grow relative overflow-hidden border rounded-md m-2 bg-gray-50">
        <div
          ref={canvasRef}
          className="absolute inset-0 overflow-auto"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative w-full h-full min-h-[600px]">
            {renderNodes()}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {renderConnections()}
              {connectingFrom && canvasRef.current && (
                <line
                  x1={(() => {
                    const fromNode = nodes.find(n => n.id === connectingFrom);
                    return fromNode ? fromNode.x + fromNode.width / 2 : 0;
                  })()}
                  y1={(() => {
                    const fromNode = nodes.find(n => n.id === connectingFrom);
                    return fromNode ? fromNode.y + fromNode.height / 2 : 0;
                  })()}
                  x2={canvasRef.current.scrollLeft + window.event?.clientX - canvasRef.current.getBoundingClientRect().left}
                  y2={canvasRef.current.scrollTop + window.event?.clientY - canvasRef.current.getBoundingClientRect().top}
                  stroke="#0066cc"
                  strokeWidth={2}
                  strokeDasharray={connectionType === 'dashed' ? '5,5' : ''}
                />
              )}
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          Tip: Ctrl+Click to add a node. Double-click a node to edit text.
        </div>
      </div>
    </div>
  );
};

export default FlowchartEditor;
