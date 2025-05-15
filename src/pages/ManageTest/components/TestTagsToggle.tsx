import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { TestFormData } from '../ManageTestModal';

interface TestTagsToggleProps {
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
  availableTags?: string[];
}

export default function TestTagsToggle({
  formData,
  setFormData,
  availableTags = [],
}: TestTagsToggleProps) {
  const [tagInput, setTagInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!tagInput.trim()) {
      const filtered = availableTags.filter((tag) => !formData.tags?.includes(tag));
      setSuggestions(filtered);
      return;
    }

    const inputLower = tagInput.toLowerCase();
    const filtered = availableTags.filter(
      (tag) => tag.toLowerCase().includes(inputLower) && !formData.tags?.includes(tag),
    );

    setSuggestions(filtered);
  }, [tagInput, availableTags, formData.tags]);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed || formData.tags.includes(trimmed)) return;

    setFormData({
      ...formData,
      tags: [...formData.tags, trimmed],
    });
    setTagInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div ref={wrapperRef} className="flex flex-col gap-2 relative">
      <label className="block text-sm font-medium text-gray-700">Tags</label>

      <div className="flex flex-wrap gap-2">
        {formData.tags?.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-500 hover:text-blue-700"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={tagInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Enter tag and press Enter"
          className="border border-gray-300 rounded-md p-2 flex-1 min-w-[120px]"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full mt-1 left-0 bg-white border rounded shadow z-10 w-full max-h-40 overflow-y-auto">
          {suggestions.map((tag, index) => (
            <li
              key={index}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              onClick={() => handleAddTag(tag)}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
