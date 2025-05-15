import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { createCode } from '~/redux/class/classSlice';
import { getCookieValue, setCookieWithExpiry, isCookieExpired } from '~/services/cookieHelper';

interface ClassCodeComponentProps {
  _id: string;
  test_id: string[];
}

interface CodeEntry {
  code: string;
  expiresAt: Date;
}

const ClassCodeComponent: React.FC<ClassCodeComponentProps> = ({ _id, test_id }) => {
  const [cookies, setCookie] = useCookies(['classIds']);
  const [classCode, setClassCode] = useState<string | null>(null);
  const [expiryMinutes, setExpiryMinutes] = useState<number>(5);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const getExpirationDate = (minutes: number): Date => new Date(Date.now() + minutes * 60 * 1000);

  const handleGenerateCode = useCallback(async () => {
    try {
      const response = await createCode({
        _id,
        minute: expiryMinutes,
        test_id,
      });

      const expirationTime = getExpirationDate(expiryMinutes);

      setClassCode(response);
      setExpiresAt(expirationTime);

      alert(`Class code generated: ${response}`);
      return { code: response, expiresAt: expirationTime };
    } catch (error) {
      console.error('Error generating class code:', error);
      alert('Failed to generate class code.');
      return null;
    }
  }, [_id, expiryMinutes, test_id]);

  const updateCookieWithCode = useCallback(
    (entry: CodeEntry) => {
      const newCodeEntry = { [_id]: entry };
      const classIds: Record<string, CodeEntry>[] = getCookieValue(cookies, 'classIds') || [];

      const existingIndex = classIds.findIndex((item) => Object.keys(item)[0] === _id);

      if (existingIndex > -1) {
        classIds[existingIndex] = newCodeEntry;
      } else {
        classIds.push(newCodeEntry);
      }

      setCookieWithExpiry(setCookie, 'classIds', classIds);
    },
    [_id, cookies, setCookie],
  );

  const generateCodeAndSave = useCallback(async () => {
    const result = await handleGenerateCode();
    if (result) updateCookieWithCode(result);
  }, [handleGenerateCode, updateCookieWithCode]);

  useEffect(() => {
    const classIds: Record<string, { code: string; expiresAt: string }>[] =
      getCookieValue(cookies, 'classIds') || [];

    const currentEntry = classIds.find((item) => Object.keys(item)[0] === _id);

    if (currentEntry) {
      const { code, expiresAt } = currentEntry[_id];
      const expireDate = new Date(expiresAt);

      if (isCookieExpired(expireDate)) {
        alert('Class code has expired. Please generate a new one.');
        const updatedClassIds = classIds.filter((item) => Object.keys(item)[0] !== _id);
        setCookieWithExpiry(setCookie, 'classIds', updatedClassIds);
      } else {
        setClassCode(code);
        setExpiresAt(expireDate);
      }
    }
  }, [_id, cookies, setCookie]);

  const copyToClipboard = () => {
    if (classCode) {
      navigator.clipboard.writeText(classCode);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Class Code</h4>

      {classCode ? (
        <div className="space-y-3">
          <input
            type="text"
            value={classCode}
            readOnly
            onClick={copyToClipboard}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-pointer"
            title="Click to copy"
          />
          {expiresAt && (
            <p className="text-sm text-gray-600">Expires at: {expiresAt.toLocaleString()}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={expiryMinutes}
            onChange={(e) => setExpiryMinutes(Number(e.target.value))}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value={1}>1 minute</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
          </select>
          <button
            onClick={generateCodeAndSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Generate
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCodeComponent;
