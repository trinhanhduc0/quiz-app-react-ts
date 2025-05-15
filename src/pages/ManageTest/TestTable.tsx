import { Plus } from 'lucide-react';
import React from 'react';
import { TestFormData } from './ManageTestModal';

type Test = {
  _id: string;
  test_name: string;
  tags: string[];
};

type TestTableProps = {
  tests: TestFormData[];
  onEdit: (test: TestFormData) => void;
  onFilterByTag: (tag: string) => void;
};

function TestTable({ tests, onEdit, onFilterByTag }: TestTableProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700">
                Test Name
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {tests.length != 0 &&
              tests.map((test) => (
                <tr
                  key={test._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEdit(test)}
                >
                  <td className="border border-gray-300 p-2">{test.test_name}</td>
                  <td className="border border-gray-300 p-2">
                    {(test.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mr-1 cursor-pointer hover:bg-blue-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterByTag(tag);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TestTable;
