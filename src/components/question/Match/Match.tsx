'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MatchAnswer } from '../QuestionComponent';
import { MatchItem, MatchOption } from '~/types/question';

interface MatchQuestionProps {
  match_items: MatchItem[];
  match_options: MatchOption[];
  onAnswerChange: (updatedAnswer: any) => void;
  answer: MatchAnswer;
  isDone: boolean;
  showAnswer: boolean;
}

const SortableMatch: React.FC<{
  id: string;
  content: string;
  isCorrect?: boolean;
  showAnswer: boolean;
  isDone: boolean;
}> = ({ id, content, isCorrect, showAnswer, isDone }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => true,
    disabled: isDone,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const bgColor = showAnswer ? (isCorrect ? 'bg-green-200' : 'bg-red-200') : 'bg-purple-200';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`p-2 ${bgColor} m-1 rounded-md shadow text-center font-medium cursor-pointer`}
    >
      {content}
    </div>
  );
};
const DroppableBox: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-wrap min-h-[60px] border p-2 rounded-md ${
        isOver ? 'bg-green-50' : 'bg-gray-100'
      } space-y-2 transition-all`}
    >
      {children}
      {/* Add an empty div to increase drop area */}
      <div className="min-h-[32px]" />
    </div>
  );
};

const MatchQuestion: React.FC<MatchQuestionProps> = ({
  match_items,
  match_options,
  onAnswerChange,
  answer,
  isDone,
  showAnswer,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  const [matches, setMatches] = useState<Record<string, string[]>>({});
  const [unmatchedOptions, setUnmatchedOptions] = useState<MatchOption[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const initMatches: Record<string, string[]> = {};
    match_items.forEach((item) => {
      initMatches[item.id as string] = answer?.[item.id as string] || [];
    });

    const matchedOptionIds = Object.values(initMatches).flat();
    const unmatched = match_options.filter((opt) => !matchedOptionIds.includes(opt.id as string));

    setMatches(initMatches);
    setUnmatchedOptions(unmatched);
  }, [match_items, match_options, answer]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const isDroppingToBank = overId === 'match-bank';
    const isDroppingToItem = match_items.some((item) => (item.id as string) === overId);

    if (!isDroppingToBank && !isDroppingToItem) return;

    const updatedMatches: Record<string, string[]> = JSON.parse(JSON.stringify(matches));

    // Remove activeId from all current matches
    for (const key in updatedMatches) {
      updatedMatches[key] = updatedMatches[key].filter((id) => id !== activeId);
    }

    if (isDroppingToItem) {
      if (!updatedMatches[overId]) updatedMatches[overId] = [];
      updatedMatches[overId].push(activeId);
    }

    const matchedOptionIds = Object.values(updatedMatches).flat();
    const updatedUnmatched = match_options.filter(
      (opt) => !matchedOptionIds.includes(opt.id as string),
    );

    const updatedMatchOptions = match_options.map((opt) => {
      const entry = Object.entries(updatedMatches).find(([_, ids]) =>
        ids.includes(opt.id as string),
      );
      return {
        ...opt,
        match_id: entry?.[0] ?? undefined,
      };
    });

    setMatches(updatedMatches);
    setUnmatchedOptions(updatedUnmatched);

    onAnswerChange({
      type: 'match_choice_question',
      answer: updatedMatches,
      match_items,
      match_options: updatedMatchOptions,
    });
  };

  const getCorrectMatchId = (optionId: string) => {
    return match_options.find((opt) => opt.id === optionId)?.match_id;
  };

  const isCorrectMatch = (itemId: string, optionId: string) => {
    return getCorrectMatchId(optionId) === itemId;
  };

  const getOptionText = (id: string) => {
    return match_options.find((opt) => opt.id === id)?.text || '';
  };

  // Khi showAnswer === true → render theo đáp án đúng
  const displayMatches = showAnswer
    ? match_items.reduce(
        (acc, item) => {
          acc[item.id as string] = match_options
            .filter((opt) => (opt.match_id as string) === item.id)
            .map((opt) => opt.id as string);
          return acc;
        },
        {} as Record<string, string[]>,
      )
    : matches;

  const displayUnmatched = showAnswer
    ? match_options.filter((opt) => !opt.match_id)
    : unmatchedOptions;

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-2 gap-4">
          {match_items.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-white shadow space-y-2">
              <div className="font-medium text-gray-700">{item.text}</div>
              <SortableContext
                items={displayMatches[item.id as string] || []}
                strategy={rectSortingStrategy}
              >
                <DroppableBox id={item.id as string}>
                  {(displayMatches[item.id as string] || []).map((optId) => (
                    <SortableMatch
                      key={optId}
                      id={optId}
                      content={getOptionText(optId)}
                      isCorrect={isCorrectMatch(item.id as string, optId)}
                      showAnswer={showAnswer}
                      isDone={isDone}
                    />
                  ))}
                </DroppableBox>
              </SortableContext>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Kho đáp án</h3>
          <SortableContext
            items={displayUnmatched.map((opt) => opt.id as string)}
            strategy={rectSortingStrategy}
          >
            <DroppableBox id="match-bank">
              {displayUnmatched.map((opt) => (
                <SortableMatch
                  key={opt.id}
                  id={opt.id as string}
                  content={opt.text as string}
                  showAnswer={false}
                  isDone={isDone}
                />
              ))}
            </DroppableBox>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="p-2 bg-purple-300 rounded-md shadow text-center font-medium">
              {getOptionText(activeId)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default MatchQuestion;
