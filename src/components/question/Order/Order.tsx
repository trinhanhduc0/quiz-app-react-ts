'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OrderAnswer } from '../QuestionComponent';
import { OrderItem } from '~/types/question';

interface OrderQuestionProps {
  order_items: OrderItem[];
  onAnswerChange: (updatedAnswer: any) => void;
  answer?: OrderAnswer;
  isDone: boolean;
  showAnswer: boolean;
}

// SortableItem component
interface SortableItemProps {
  item: OrderItem;
}

const SortableItem: React.FC<SortableItemProps> = ({ item }: { item: OrderItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id as string,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`p-4 bg-gray-100 rounded-lg shadow-md cursor-grab ${
        isDragging ? 'bg-purple-600 text-white' : ''
      }`}
    >
      {item.text}
    </li>
  );
};

// Main component
const OrderQuestion: React.FC<OrderQuestionProps> = ({
  order_items,
  onAnswerChange,
  answer,
  isDone,
  showAnswer,
}) => {
  const getInitialItems = (): OrderItem[] => {
    if (showAnswer) {
      const correctIds = order_items.map((item) => item.id ?? '');
      return [...order_items].sort(
        (a, b) => correctIds.indexOf(a.id as string) - correctIds.indexOf(b.id as string),
      );
    }
    console.log(order_items);
    if (answer && answer.length > 0) {
      return [...order_items].sort((a, b) => {
        const aIndex = answer.indexOf(a.id as string);
        const bIndex = answer.indexOf(b.id as string);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return [...order_items]; // shallow copy to prevent mutation
  };

  const [items, setItems] = useState<OrderItem[]>(getInitialItems);

  useEffect(() => {
    setItems(getInitialItems());
  }, [showAnswer, answer, order_items]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isDone) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    console.log('move', oldIndex, newIndex);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    console.log(items, newItems);

    const itemIds = newItems.map((item) => item.id);
    const order_items = newItems.map((item) => ({ id: item.id }));
    onAnswerChange({
      answer: itemIds,
      order_items: order_items,
    });
  };

  return (
    <div className="px-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((item) => item.id as string)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-4">
            {items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default OrderQuestion;
