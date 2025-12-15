
"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Layers } from 'lucide-react';

interface CustomData extends Record<string, unknown> {
    label: string;
    title: string;
}

type CustomNodeType = Node<CustomData>;

export const CustomNode = memo(({ data, isConnectable }: NodeProps<CustomNodeType>) => {
    return (
        <div className="group relative">
            {/* Glow Effect */}
            <div
                className="absolute inset-0 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity duration-500 blur-md bg-[#00F0FF]/20"
            />

            <div
                className="relative min-w-[150px] px-4 py-3 rounded-lg flex items-center gap-3 backdrop-blur-md"
                style={{
                    background: 'rgba(5, 5, 5, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
                }}
            >
                <div className="p-1.5 rounded bg-[#00F0FF]/10 text-[#00F0FF]">
                    <Layers className="w-4 h-4" />
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-[#00F0FF] font-mono tracking-wider opacity-60">
                        {data.label}
                    </span>
                    <span className="text-sm font-bold text-white tracking-wide">
                        {data.title || data.label}
                    </span>
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="!w-2 !h-2 !bg-[#00F0FF] !border-none"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="!w-2 !h-2 !bg-[#00F0FF] !border-none"
            />
        </div>
    );
});

CustomNode.displayName = "CustomNode";
