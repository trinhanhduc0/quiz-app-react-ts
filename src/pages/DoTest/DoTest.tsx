'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_ENDPOINTS from '~/config';
import QuestionComponent, { type Answer } from '~/components/question/QuestionComponent';
import type { QuestionAnswer, TestAnswer } from '~/types/quiz';
import { FillInTheBlank, MatchItem, OrderItem, Question } from '~/types/question';
import { apiCallPost } from '~/services/apiCallService';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface InfoTest {
  isDone?: boolean;
  duration_minutes: number;
}

interface Params extends Record<string, string | undefined> {
  isTest?: string;
  author: string;
  testId?: string;
  classId?: string;
}

interface OptionAnswer {
  id: string;
  matchid?: string;
}

const DoTest: React.FC = () => {
  const navigate = useNavigate();
  const { isTest, author, testId, classId } = useParams<Params>();

  const questionCache = `questions_${testId}`;
  const answerCache = `quizAnswers_${testId}`;
  const startTimeCache = `test_start_time_${testId}`;

  const [infoTest, setInfoTest] = useState<InfoTest | null>(null);
  const [countdownTime, setCountdownTime] = useState<CountdownTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => {
    const saved = localStorage.getItem(answerCache);
    return saved ? JSON.parse(saved) : {};
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isDone, setIsDone] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const handleAnswerChange = (questionId: string, answer: Answer) => {
    setSaveStatus('saving');
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: answer };
      try {
        localStorage.setItem(answerCache, JSON.stringify(updated));
        setTimeout(() => setSaveStatus('saved'), 500);
      } catch (err) {
        setSaveStatus('error');
      }
      return updated;
    });
  };

  function handleCurrentQuestionAnswerChange(answer: Answer) {
    handleAnswerChange(currentQuestion._id, answer);
  }

  const apiSendTest = async () => {
    const filteredAnswers = Object.entries(answers).reduce(
      (acc, [key, value]) => {
        acc[key] = {
          type: value.type,
          answer: value.answer,
        };
        return acc;
      },
      {} as Record<string, { type: string; answer: any }>,
    );

    const testAnswer: TestAnswer = {
      author_mail: author as string,
      class_id: classId as string,
      test_id: testId as string,
      question_answer: filteredAnswers,
    };

    try {
      const res = await apiCallPost(API_ENDPOINTS.SENDTEST, testAnswer, navigate);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleSendTest = async () => {
    if (!window.confirm('Bạn chắc chắn muốn nộp bài?')) return;

    if (isTest !== 'false') {
      try {
        setSaveStatus('saving');
        await apiSendTest();
        setSaveStatus('saved');
        alert('Nộp bài thành công!');
        localStorage.removeItem(questionCache);
        localStorage.removeItem(answerCache);
        localStorage.removeItem(`test_end_time_${testId}`);
        localStorage.removeItem(startTimeCache);
        window.location.reload();
      } catch {
        setSaveStatus('error');
        alert('Đã có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      }
    } else {
      localStorage.removeItem(`test_end_time_${testId}`);
      localStorage.removeItem(startTimeCache);
      setIsDone(true);
      const cached = localStorage.getItem(questionCache);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAnswers(simplifyAnswerData(parsed.answer));
      }
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  const simplifyAnswerData = (input: Record<string, any>): Record<string, Answer> => {
    const map: Record<string, Answer> = {};
    console.log(input);
    Object.entries(input).forEach(([questionId, qa]) => {
      if (qa.type === 'fill_in_the_blank') {
        map[questionId] = {
          id: questionId,
          type: qa.type,
          answer: qa.answer || {},
          fill_in_the_blanks: Object.entries(qa.answer || {}).map(([id, correct_answer]) => ({
            id,
            correct_answer: String(correct_answer),
          })),
          options: [],
        };
      } else if (qa.type === 'match_choice_question') {
        const matchMap: Record<string, string[]> = qa.answer || {};
        map[questionId] = {
          id: questionId,
          type: qa.type,
          answer: matchMap,
          match_items: [],
          match_options: [],
        };
      } else if (qa.type === 'order_question') {
        map[questionId] = {
          id: questionId,
          type: qa.type,
          answer: qa.answer || [],
          options: (qa.answer || []).map((id: string) => ({ id })),
          fill_in_the_blanks: [],
        };
      } else if (qa.type === 'multiple_choice_question') {
        map[questionId] = {
          id: questionId,
          type: qa.type,
          answer: qa.answer || [],
          options: (qa.answer || []).map((id: string) => ({ id })),
          fill_in_the_blanks: [],
        };
      } else {
        // single_choice_question or other types
        map[questionId] = {
          id: questionId,
          type: qa.type,
          answer: qa.answer || '',
          options: qa.answer ? [{ id: qa.answer }] : [],
          fill_in_the_blanks: [],
        };
      }
    });

    return map;
  };

  useEffect(() => {
    let timerCleanup: (() => void) | undefined;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const cached = localStorage.getItem(questionCache);

        if (cached) {
          const parsed = JSON.parse(cached);
          setInfoTest(parsed.test_info);
          setQuestions(parsed.questions || []);
          if ('answer' in parsed) {
            setIsDone(true);
            setScore(parsed.answer.score);
            setAnswers(parsed.answer.question_answer);
          } else {
            const savedAnswers = localStorage.getItem(answerCache);
            if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
            console.log(isTest);
            if (isTest == 'true') {
              timerCleanup = startCountdown(parsed.test_info);
            }
          }
          return;
        }

        const response = await apiCallPost<any>(
          API_ENDPOINTS.GETQUESTIONS,
          { class_id: classId, author_mail: author, test_id: testId, is_test: isTest === 'true' },
          navigate,
        );

        localStorage.setItem(
          questionCache,
          JSON.stringify({
            test_info: response.test_info,
            questions: response.questions,
            answer: response.answer,
          }),
        );
        setInfoTest(response.test_info);
        setQuestions(response.questions || []);

        if (!localStorage.getItem(startTimeCache)) {
          localStorage.setItem(startTimeCache, new Date().toISOString());
        }

        if ('answer' in response) {
          setIsDone(true);
          setScore(response.answer.score);
          setAnswers(simplifyAnswerData(response.answer));
        } else {
          const savedAnswers = localStorage.getItem(answerCache);
          if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
          timerCleanup = startCountdown(response.test_info);
        }
      } catch (err) {
        console.log(err);
        setError('Lỗi khi tải đề thi');
      } finally {
        setLoading(false);
      }
    };

    const startCountdown = (testInfo: InfoTest) => {
      const now = Date.now();
      const cachedEnd = localStorage.getItem(`test_end_time_${testId}`);
      const endTime = cachedEnd ? parseInt(cachedEnd) : now + testInfo.duration_minutes * 60000;

      if (!cachedEnd) localStorage.setItem(`test_end_time_${testId}`, endTime.toString());

      const interval = setInterval(() => {
        const diff = endTime - Date.now();
        if (diff <= 0) {
          clearInterval(interval);
          apiSendTest().then(() => alert('Hết giờ làm bài. Bài đã được tự động nộp.'));
        } else {
          setCountdownTime({
            hours: Math.floor(diff / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    };

    fetchQuestions();
    return () => timerCleanup?.();
  }, [testId, author, isTest, classId, answers]);

  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 text-blue-600 border-4 border-blue-400 border-t-transparent rounded-full" />
    </div>
  ) : error ? (
    <div className="text-red-600 text-center p-6 text-lg">{error}</div>
  ) : (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      {/* Countdown and Progress */}
      {!isDone && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            {isTest == 'true' && (
              <div className="text-lg font-semibold text-red-600">
                Thời gian còn lại: {countdownTime.hours}h {countdownTime.minutes}m{' '}
                {countdownTime.seconds}s
              </div>
            )}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-yellow-500 text-sm">Đang lưu...</span>
              )}
              {saveStatus === 'saved' && <span className="text-green-500 text-sm">Đã lưu</span>}
              {saveStatus === 'error' && <span className="text-red-500 text-sm">Lỗi lưu</span>}
              {isTest == 'true' && (
                <button
                  onClick={handleSendTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Nộp bài
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 text-right">
            Đã trả lời: {answeredCount}/{questions.length} câu hỏi
          </div>
        </div>
      )}

      {isDone ? (
        <div className="text-green-700 font-semibold text-xl text-center">
          Điểm: {score}/{totalScore}
        </div>
      ) : null}

      {currentQuestion ? (
        <div>
          <QuestionComponent
            question={currentQuestion}
            isDone={isDone}
            showAnswer={showAnswer}
            answer={answers[currentQuestion._id] || null}
            onAnswerChange={handleCurrentQuestionAnswerChange}
            author={author || ''}
          />
        </div>
      ) : null}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.max(i - 1, 0))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="mr-2" /> Câu trước
        </button>

        <div className="text-sm text-gray-600">
          Câu {currentQuestionIndex + 1}/{questions.length}
        </div>

        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1))}
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Câu tiếp <ChevronRight className="ml-2" />
        </button>
      </div>

      {(isDone || isTest !== 'true') && (
        <div className="flex justify-center items-center">
          <button
            onClick={handleShowAnswer}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 
        ${showAnswer ? 'bg-blue-500 text-white hover:bg-white-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}
      `}
          >
            {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
        </div>
      )}

      {/* Danh sách câu */}
      <div className="flex flex-wrap gap-2 mt-4">
        {questions.map((q, i) => {
          // Check if this question has an answer
          const hasAnswer = !!answers[q._id];

          return (
            <button
              key={q._id}
              onClick={() => setCurrentQuestionIndex(i)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border 
                ${
                  currentQuestionIndex === i
                    ? 'bg-blue-600 text-white'
                    : hasAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-white hover:bg-gray-100'
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoTest;
