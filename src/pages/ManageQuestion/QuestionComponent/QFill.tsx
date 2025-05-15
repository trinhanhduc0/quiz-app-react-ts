import { MinusCircle, Plus } from 'lucide-react';
import { FillInTheBlank } from '~/types/question';

// export interface FillItem {
//   text_before: string;
//   blank: string;
//   text_after: string;
//   correct_answer: string;
// }

interface FillInTheBlankEditorProps {
  fill_in_the_blanks: FillInTheBlank[];
  onChange: (fill_in_the_blanks: FillInTheBlank[]) => void;
}

export default function FillInTheBlankEditor({
  fill_in_the_blanks,
  onChange,
}: FillInTheBlankEditorProps) {
  const handleChange = (index: number, key: keyof FillInTheBlank, value: string) => {
    const newItems = [...fill_in_the_blanks];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };

  const handleRemove = (index: number) => {
    onChange(fill_in_the_blanks.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([
      ...fill_in_the_blanks,
      {
        id: '',
        text_before: '',
        blank: '_____',
        text_after: '',
        correct_answer: '',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {fill_in_the_blanks.map((item, index) => (
        <div key={index} className="border rounded-md p-4 space-y-2">
          <input
            value={item.text_before}
            onChange={(e) => handleChange(index, 'text_before', e.target.value)}
            className="block w-full border border-gray-300 rounded-md p-2"
            placeholder="Text before blank"
            required
          />
          <input
            value={item.correct_answer}
            onChange={(e) => handleChange(index, 'correct_answer', e.target.value)}
            className="block w-full border border-gray-300 rounded-md p-2"
            placeholder="Correct answer"
            required
          />{' '}
          <input
            value={item.text_after}
            onChange={(e) => handleChange(index, 'text_after', e.target.value)}
            className="block w-full border border-gray-300 rounded-md p-2"
            placeholder="Text after blank"
            required
          />
          <input
            value={item.blank}
            onChange={(e) => handleChange(index, 'blank', e.target.value)}
            className="block w-full border border-gray-300 rounded-md p-2"
            placeholder="Blank (e.g., _____)"
            required
          />
          <p className="text-sm italic text-gray-500">
            Preview: {item.text_before} <span className="underline">{item.blank}</span>{' '}
            {item.text_after}
          </p>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <MinusCircle className="h-5 w-5" /> Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 border border-dashed border-blue-500 text-blue-500 px-4 py-2 rounded-md w-full hover:bg-blue-50"
      >
        <Plus className="h-5 w-5" /> Add Blank
      </button>
    </div>
  );
}
