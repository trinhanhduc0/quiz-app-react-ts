import { ObjectId } from 'bson';
import { MatchItem, MatchOption } from '~/types/question';

interface MatchChoiceEditorProps {
  match_options: MatchOption[];
  match_items: MatchItem[];
  onChangeOptions: (options: MatchOption[]) => void;
  onChangeItems: (items: MatchItem[]) => void;
}

export default function MatchChoiceEditor({
  match_options,
  match_items,
  onChangeOptions,
  onChangeItems,
}: MatchChoiceEditorProps) {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...match_items];
    newItems[index] = { ...newItems[index], text: value };
    onChangeItems(newItems);
  };
  const generateObjectId = (): string => {
    return (
      Math.floor(Date.now() / 1000).toString(16) +
      'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
    );
  };
  const addItem = () => {
    const newId = generateObjectId(); // ID tạm thời
    onChangeItems([...match_items, { id: newId, text: '' }]);
  };

  const removeItem = (itemId: string) => {
    onChangeItems(match_items.filter((item) => item.id !== itemId));
    onChangeOptions(match_options.filter((opt) => opt.match_id !== itemId)); // Xoá luôn options đi kèm
  };

  // Xử lý thêm/sửa/xoá MatchOption trong từng item
  const handleOptionChange = (optionId: string, value: string) => {
    console.log(match_options);
    const newOptions = match_options.map((opt) =>
      opt.id === optionId ? { ...opt, text: value } : opt,
    );
    console.log(newOptions);
    onChangeOptions(newOptions);
  };

  const addOptionToItem = (matchId: string) => {
    const newOption: MatchOption = {
      id: generateObjectId(), // để giữ id là string
      text: '',
      match_id: matchId,
    };
    onChangeOptions([...match_options, newOption]);
  };

  const removeOption = (optionId: string) => {
    onChangeOptions(match_options.filter((opt) => opt.id !== optionId));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Danh sách các đích nối (Match Items)</h3>
      {match_items.map((item, i) => {
        const optionsForItem = match_options.filter((opt) => opt.match_id === item.id);

        return (
          <div key={item.id} className="border rounded p-4 space-y-3 bg-gray-50">
            <div className="flex items-start gap-2">
              <textarea
                value={item.text}
                onChange={(e) => handleItemChange(i, e.target.value)}
                className="w-full border p-2 rounded"
                placeholder={`Nội dung item ${i + 1}`}
              />
              <button type="button" onClick={() => removeItem(item.id!)} className="text-red-500">
                X
              </button>
            </div>

            <div className="ml-4 space-y-2">
              {optionsForItem.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(opt.id!, e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Lựa chọn tương ứng"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id!)}
                    className="text-red-500"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOptionToItem(item.id!)}
                className="text-blue-600 text-sm"
              >
                + Thêm lựa chọn cho item
              </button>
            </div>
          </div>
        );
      })}
      <button onClick={addItem} type="button" className="text-green-600 mt-2">
        + Thêm đích nối (item)
      </button>
    </div>
  );
}
