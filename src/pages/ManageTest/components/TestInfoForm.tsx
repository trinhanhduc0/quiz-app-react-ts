import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export default function TestInfoForm({ formData, setFormData }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Test Name</label>
        <input
          value={formData.test_name}
          onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          maxLength={51}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <TextareaAutosize
          minRows={3}
          maxRows={10}
          value={formData.descript}
          onChange={(e) => setFormData({ ...formData, descript: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div className="flex flex-col">
        <label class="inline-flex items-center cursor-pointer mt-2">
          {console.log(formData.is_test)}
          <input
            type="checkbox"
            checked={formData.is_test}
            class="sr-only peer"
            onChange={(e) => {
              setFormData({ ...formData, is_test: e.target.checked });
              console.log(formData);
            }}
          />
          <div class="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">IS TEST ?</span>
        </label>
      </div>
    </>
  );
}
