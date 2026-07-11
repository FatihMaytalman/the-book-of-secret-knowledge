'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { PersonSummary } from '@aomlegacy/shared';
import {
  buildLayout,
  childrenOf,
  type TreeRelationship,
  toTreePeople,
} from '@/lib/relationships';

interface PersonNodeData {
  name: string;
  meta: string;
  hasChildren: boolean;
  collapsed: boolean;
  onToggle: () => void;
  [key: string]: unknown;
}

function PersonNode({ data }: NodeProps<Node<PersonNodeData>>) {
  return (
    <div className="rounded-xl border border-white/15 bg-navy-950/90 px-4 py-3 shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <div className="font-medium text-cream-50">{data.name}</div>
      <div className="text-xs text-warm-white/60">{data.meta}</div>
      {data.hasChildren ? (
        <button
          type="button"
          className="mt-2 rounded-full border border-gold-500/40 px-2 py-0.5 text-xs text-gold-500"
          title={data.collapsed ? 'Expand branch' : 'Collapse branch'}
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle();
          }}
        >
          {data.collapsed ? '+' : '−'}
        </button>
      ) : null}
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
}

const nodeTypes = { person: PersonNode };

interface FamilyTreeCanvasProps {
  familyId: string;
  people: PersonSummary[];
  relationships: TreeRelationship[];
}

export function FamilyTreeCanvas({ familyId, people, relationships }: FamilyTreeCanvasProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const treePeople = useMemo(() => toTreePeople(people), [people]);

  const toggle = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const { nodes, edges } = useMemo(() => {
    const layout = buildLayout(treePeople, relationships, collapsed);
    const byId = new Map(treePeople.map((p) => [p.id, p]));

    const rfNodes: Node<PersonNodeData>[] = layout.nodes.map((n) => {
      const person = byId.get(n.id)!;
      const kids = childrenOf(relationships, n.id);
      const meta =
        [
          person.birthDate ? `b. ${person.birthDate.slice(0, 4)}` : '',
          person.deathDate ? `d. ${person.deathDate.slice(0, 4)}` : '',
        ]
          .filter(Boolean)
          .join(' · ') || (person.isLiving ? 'Living' : '');

      return {
        id: n.id,
        type: 'person',
        position: { x: n.x, y: n.y },
        data: {
          name: person.displayName,
          meta,
          hasChildren: kids.length > 0,
          collapsed: collapsed.has(n.id),
          onToggle: () => toggle(n.id),
        },
      };
    });

    const visible = new Set(layout.nodes.map((n) => n.id));
    const rfEdges: Edge[] = relationships
      .filter((r) => visible.has(r.fromPersonId) && visible.has(r.toPersonId))
      .map((r) => {
        if (r.type === 'parent') {
          return {
            id: r.id,
            source: r.fromPersonId,
            sourceHandle: 'bottom',
            target: r.toPersonId,
            targetHandle: 'top',
            style: { stroke: '#2ec4b6', strokeWidth: 2 },
          } satisfies Edge;
        }
        return {
          id: r.id,
          source: r.fromPersonId,
          sourceHandle: 'right',
          target: r.toPersonId,
          targetHandle: 'left',
          animated: r.type === 'partner',
          label: r.type,
          style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5 4' },
        } satisfies Edge;
      });

    return { nodes: rfNodes, edges: rfEdges };
  }, [treePeople, relationships, collapsed]);

  if (people.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-warm-white/60">
        Add people and relationships to see the interactive family tree.
      </div>
    );
  }

  return (
    <div className="h-[560px] rounded-2xl border border-white/10 bg-navy-950/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        onNodeClick={(_event: React.MouseEvent, node: Node) => {
          window.location.href = `/family/${familyId}/people/${node.id}`;
        }}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
