import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { Person, Relationship } from '../types';
import { buildLayout, childrenOf } from '../lib/relationships';
import { EmptyState } from './ui';

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
    <div className="tree-node">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <div className="tree-node__name">{data.name}</div>
      <div className="tree-node__meta">{data.meta}</div>
      {data.hasChildren ? (
        <button
          className="tree-node__toggle"
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

export function FamilyTree({
  familyId,
  people,
  relationships,
}: {
  familyId: string;
  people: Person[];
  relationships: Relationship[];
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const { nodes, edges } = useMemo(() => {
    const layout = buildLayout(people, relationships, collapsed);
    const byId = new Map(people.map((p) => [p.id, p]));

    const rfNodes: Node<PersonNodeData>[] = layout.nodes.map((n) => {
      const person = byId.get(n.id)!;
      const kids = childrenOf(relationships, n.id);
      const meta = [
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
            style: { stroke: 'var(--primary)', strokeWidth: 2 },
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
  }, [people, relationships, collapsed]);

  if (people.length === 0) {
    return <EmptyState icon="🌳" title="Add people and relationships to see the tree" />;
  }

  return (
    <div className="tree-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => navigate(`/family/${familyId}/people/${node.id}`)}
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
