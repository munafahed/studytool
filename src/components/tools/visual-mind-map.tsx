"use client";

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileImage } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MindMapNode {
  title: string;
  description?: string;
  children?: MindMapNode[];
  color?: string;
}

interface VisualMindMapProps {
  data: MindMapNode;
  template: string;
}

export default function VisualMindMap({ data, template }: VisualMindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const convertToFlowNodes = useCallback((
    node: MindMapNode,
    parentId: string | null = null,
    level: number = 0,
    index: number = 0,
    totalSiblings: number = 1
  ): { nodes: Node[]; edges: Edge[] } => {
    const nodeId = `node-${level}-${index}`;
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    let x = 0;
    let y = 0;

    // Calculate position based on template type
    if (template === 'hierarchical' || template === 'organizational') {
      x = (index - totalSiblings / 2) * 250;
      y = level * 150;
    } else if (template === 'radial') {
      if (level === 0) {
        x = 0;
        y = 0;
      } else {
        const angle = (2 * Math.PI * index) / totalSiblings;
        const radius = level * 200;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }
    } else if (template === 'flowchart') {
      x = level * 300;
      y = index * 120;
    }

    // Create the node
    flowNodes.push({
      id: nodeId,
      type: level === 0 ? 'input' : 'default',
      data: { 
        label: (
          <div className="text-center">
            <div className="font-semibold">{node.title}</div>
            {node.description && (
              <div className="text-xs text-muted-foreground mt-1">{node.description}</div>
            )}
          </div>
        )
      },
      position: { x, y },
      style: {
        background: node.color || (level === 0 ? '#3B82F6' : '#fff'),
        color: level === 0 || node.color ? '#fff' : '#000',
        border: `2px solid ${node.color || '#3B82F6'}`,
        borderRadius: '8px',
        padding: '10px',
        minWidth: '150px',
      },
    });

    // Create edge to parent
    if (parentId) {
      flowEdges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        animated: level <= 1,
        style: { stroke: node.color || '#3B82F6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: node.color || '#3B82F6',
        },
      });
    }

    // Process children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, childIndex) => {
        const childResult = convertToFlowNodes(
          child,
          nodeId,
          level + 1,
          childIndex,
          node.children!.length
        );
        flowNodes.push(...childResult.nodes);
        flowEdges.push(...childResult.edges);
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [template]);

  useEffect(() => {
    const { nodes: flowNodes, edges: flowEdges } = convertToFlowNodes(data);
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [data, convertToFlowNodes, setNodes, setEdges]);

  const downloadAsJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mind-map.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPNG = async () => {
    if (reactFlowWrapper.current) {
      const canvas = await html2canvas(reactFlowWrapper.current);
      const link = document.createElement('a');
      link.download = 'mind-map.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const downloadAsPDF = async () => {
    if (reactFlowWrapper.current) {
      const canvas = await html2canvas(reactFlowWrapper.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('mind-map.pdf');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button onClick={downloadAsJSON} variant="outline" size="sm">
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </Button>
        <Button onClick={downloadAsPNG} variant="outline" size="sm">
          <FileImage className="h-4 w-4 mr-2" />
          PNG
        </Button>
        <Button onClick={downloadAsPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
      
      <div ref={reactFlowWrapper} className="w-full h-[600px] border rounded-lg bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
