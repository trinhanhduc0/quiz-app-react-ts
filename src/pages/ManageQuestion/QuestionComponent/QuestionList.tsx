import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { QUESTION_TYPES, TYPE_STYLES } from '~/constants/questionTypes';

import { Question } from '~/types/question';
import { QuestionFormData } from '~/constants/formData';

interface QuestionListProps {
  filteredData: Question[];
  questions: Question[];
  handleOpenModalQuestion: (question: QuestionFormData) => void;
  toggleTagSelection: (tag: string) => void;
  selectedTags: string[];
  handleDelete: (id: string) => void;
  selectable: boolean;
  selectedQuestionIds: string[];
  toggleQuestionSelection: (id: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  filteredData,
  questions,
  handleOpenModalQuestion,
  toggleTagSelection,
  selectedTags,
  handleDelete,
  selectable,
  selectedQuestionIds,
  toggleQuestionSelection,
}) => {
  const data = useMemo(() => filteredData, [filteredData]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState(selectedQuestionIds);
  useEffect(() => {
    setSelectedQuestion(selectedQuestionIds);
  }, [selectedQuestionIds]);

  const isSelected = (id: string) => selectedQuestionIds.includes(id);

  const toggleCheckbox = (id: string) => {
    toggleQuestionSelection(id);
  };

  const toggleAllVisibleCheckboxes = () => {
    const visibleIds = table.getRowModel().rows.map((row) => row.original._id);
    const allSelected = visibleIds.every((id) => selectedQuestionIds.includes(id));

    visibleIds.forEach((id) => {
      if (allSelected) {
        toggleQuestionSelection(id); // Unselect nếu đang chọn hết
      } else {
        if (!selectedQuestionIds.includes(id)) {
          toggleQuestionSelection(id); // Select nếu chưa chọn
        }
      }
    });
  };

  const columns: ColumnDef<Question>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            onChange={() =>
              table.getRowModel().rows.forEach((row) => toggleCheckbox(row.original._id))
            }
            checked={table.getRowModel().rows.every((row) => isSelected(row.original._id))}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={isSelected(row.original._id)}
            onChange={() => toggleCheckbox(row.original._id)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: 'question_content.text',
        header: () => `Total ${filteredData.length}/${questions.length} Questions`,
        cell: ({ row }) => {
          const content = row.original.question_content?.text;
          return <div>{content}</div>;
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) => {
          const typeQuestion = row.original.type;
          const { bgColor, label } = TYPE_STYLES[typeQuestion || ''] || {
            bgColor: 'bg-gray-400',
            label: typeQuestion,
          };
          return (
            <span className={`${bgColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
              {label}
            </span>
          );
        },
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
          const tags = row.original.tags || [];
          return (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag: string) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTagSelection(tag);
                  }}
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          );
        },
      },
    ],
    [
      filteredData.length,
      questions.length,
      toggleTagSelection,
      selectedTags,
      selectedIds,
      selectedQuestionIds,
      selectable,
      toggleQuestionSelection,
    ],
  );

  // 👉 tạo table SAU columns
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDeleteSelected = () => {
    if (
      window.confirm(`Are you sure you want to delete ${selectedIds.length} selected question(s)?`)
    ) {
      selectedIds.forEach((id) => handleDelete(id));
      setSelectedIds([]);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        {!selectable && (
          <>
            <div className="text-sm text-gray-600">Selected: {selectedIds.length}</div>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Delete Selected
            </button>
          </>
        )}
      </div>

      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' 🔼'}
                  {header.column.getIsSorted() === 'desc' && ' 🔽'}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  const normalizedData: QuestionFormData = {
                    ...row.original,
                    metadata: row.original.metadata ?? {},
                    options: row.original.options ?? [],
                    match_items: row.original.match_items ?? [],
                    match_options: row.original.match_options ?? [],
                    order_items: row.original.order_items ?? [],
                    fill_in_the_blank: row.original.fill_in_the_blanks ?? [],
                    question_content: row.original.question_content ?? {},
                    suggestion: row.original.suggestion ?? [''],
                    tags: row.original.tags ?? [],
                    type: row.original.type ?? '',
                    score: row.original.score ?? 0,
                    correct_map: row.original.correct_map ?? []
                  };
                  handleOpenModalQuestion(normalizedData);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border border-gray-300 p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="border border-gray-300 p-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 px-2">
        <div className="text-sm text-gray-600">
          Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
