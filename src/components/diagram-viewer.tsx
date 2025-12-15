
"use client";

import React, { useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    Node,
    Edge,
    Position,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { CustomNode } from './diagram-node';

const nodeTypes = {
    custom: CustomNode,
};

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: newNodes, edges };
};


interface DiagramViewerProps {
    initialNodes: Node[];
    initialEdges: Edge[];
}

function DiagramViewerContent({ initialNodes, initialEdges }: DiagramViewerProps) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Auto Layout on mount
    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Fit view after a small delay to handle layout updates
        setTimeout(() => {
            fitView({ padding: 0.2 });
        }, 50);
    }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

    // Also re-fit on resize (optional, handled by Pro version but we can trigger it manually)
    useEffect(() => {
        window.addEventListener('resize', () => fitView({ padding: 0.2 }));
        return () => window.removeEventListener('resize', () => fitView({ padding: 0.2 }));
    }, [fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            proOptions={{ hideAttribution: true }}
            minZoom={0.5}
            maxZoom={1.5}
            defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#00F0FF', strokeWidth: 2 },
            }}
        >
            <Background color="#1a1a1a" gap={20} size={1} />
            <Controls className="!bg-[#050505] !border-white/10 [&>button]:!fill-white [&>button]:!border-b-white/10 hover:[&>button]:!bg-white/10" />
        </ReactFlow>
    );
}

export function DiagramViewer(props: DiagramViewerProps) {
    return (
        <ReactFlowProvider>
            <DiagramViewerContent {...props} />
        </ReactFlowProvider>
    );
}
