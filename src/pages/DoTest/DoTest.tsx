'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_ENDPOINTS from '~/config';
import QuestionComponent, { type Submission } from '~/components/question/QuestionComponent';
import type { QuestionSubmission, TestSubmission } from '~/types/quiz';
import { FillInTheBlank, MatchItem, OrderItem, Question } from '~/types/question';
import { apiCallPost } from '~/services/apiCallService';
import { time, timeEnd } from 'console';
import { TfiReload } from "react-icons/tfi";
import { useTranslation } from 'react-i18next';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface InfoTest {
  isDone?: boolean;
  duration_minutes: number;
  is_test: boolean;
  end_time: string
}

interface Params extends Record<string, string | undefined> {
  author: string;
  testId?: string;
  classId?: string;
}



const DoTest: React.FC = () => {
  const navigate = useNavigate();
  const { author, testId, classId } = useParams<Params>();
  const { t } = useTranslation();

  const questionCache = `questions_${testId}`;
  const submissionCache = `quizSubmissions_${testId}`;
  const startTimeCache = `test_start_time_${testId}`;
  const endTimeCache = `test_end_time_${testId}`
  const [infoTest, setInfoTest] = useState<InfoTest | null>(null);
  const isTest = infoTest?.is_test === true;
  const [countdownTime, setCountdownTime] = useState<CountdownTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(() => {
    const saved = localStorage.getItem(submissionCache);
    return saved ? JSON.parse(saved) : {};
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isDone, setIsDone] = useState<boolean>(false);
  const [showSubmission, setShowSubmission] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);


  const resetTest = () => {
    localStorage.removeItem(questionCache);
    localStorage.removeItem(submissionCache);
    localStorage.removeItem(endTimeCache);
    localStorage.removeItem(startTimeCache);

    window.location.reload()
  }

  const handleSubmissionChange = (questionId: string, submission: Submission) => {
    setSaveStatus('saving');
    setSubmissions((prev) => {
      const updated = { ...prev, [questionId]: submission };
      try {
        localStorage.setItem(submissionCache, JSON.stringify(updated));
        setTimeout(() => setSaveStatus('saved'), 500);
      } catch (err) {
        setSaveStatus('error');
      }
      return updated;
    });
  };

  function handleCurrentQuestionSubmissionChange(submission: Submission) {
    handleSubmissionChange(currentQuestion._id, submission);
  }

  const apiSendTest = async () => {
    const filteredSubmissions = Object.entries(submissions).reduce(
      (acc, [key, value]) => {
        acc[key] = {
          type: value.type,
          submission: value.submission,
        };
        return acc;
      },
      {} as Record<string, { type: string; submission: any }>,
    );

    const testSubmission: TestSubmission = {
      author_mail: author as string,
      class_id: classId as string,
      test_id: testId as string,
      question_submission: filteredSubmissions,
    };


    try {
      const res = await apiCallPost(API_ENDPOINTS.SUBMIT_TEST, testSubmission, navigate);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const handleSendTest = async () => {
    if (!window.confirm(t('doTest.confirm_submit'))) return;

    if (infoTest?.is_test) {
      try {
        setSaveStatus('saving');
        await apiSendTest();
        setSaveStatus('saved');
        alert(t('doTest.submit_success'));
        localStorage.removeItem(questionCache);
        localStorage.removeItem(submissionCache);
        localStorage.removeItem(endTimeCache);
        localStorage.removeItem(startTimeCache);
        window.location.reload();
      } catch {
        setSaveStatus('error');
        alert(t('doTest.submit_error'));
      }
    } else {
      localStorage.removeItem(`test_end_time_${testId}`);
      localStorage.removeItem(startTimeCache);
      setIsDone(true);
      const cached = localStorage.getItem(questionCache);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSubmissions(simplifySubmissionData(parsed.submission));
      }
    }
  };

  const handleShowSubmission = () => {
    setShowSubmission((prev) => !prev);
  };

  const simplifySubmissionData = (input: Record<string, any>): Record<string, Submission> => {
    const map: Record<string, Submission> = {};
    Object.entries(input).forEach(([questionId, qa]) => {
      if (qa.type === 'fill_in_the_blank') {
        map[questionId] = {
          id: questionId,
          type: qa.type,
          submission: qa.submission || {},
          fill_in_the_blanks: Object.entries(qa.submission || {}).map(([id, correct_submission]) => ({
            id,
            correct_submission: String(correct_submission),
          })),
          options: [],
        };
      } else if (qa.type === 'match_choice_question') {
        const matchMap: Record<string, string[]> = qa.submission || {};
        map[questionId] = {
          id: questionId,
          type: qa.type,
          submission: matchMap,
          match_items: [],
          match_options: [],
        };
      } else if (qa.type === 'order_question') {
        map[questionId] = {
          id: questionId,
          type: qa.type,
          submission: qa.submission || [],
          options: (qa.submission || []).map((id: string) => ({ id })),
          fill_in_the_blanks: [],
        };
      } else if (qa.type === 'multiple_choice_question') {
        map[questionId] = {
          id: questionId,
          type: qa.type,
          submission: qa.submission || [],
          options: (qa.submission || []).map((id: string) => ({ id })),
          fill_in_the_blanks: [],
        };
      } else {
        // single_choice_question or other types
        map[questionId] = {
          id: questionId,
          type: qa.type,
          submission: qa.submission || '',
          options: qa.submission ? [{ id: qa.submission }] : [],
          fill_in_the_blanks: [],
        };
      }
    });

    return map;
  };

  const getActualEndTime = (
    startTimeISO: string,
    durationMinutes: number,
    testEndTimeISO: string,
  ) => {
    const start = new Date(startTimeISO).getTime();
    const durationEnd = start + durationMinutes * 60 * 1000;
    const testEnd = new Date(testEndTimeISO).getTime();

    return new Date(Math.min(durationEnd, testEnd)).toISOString();
  };


  useEffect(() => {
    let timerCleanup: (() => void) | undefined;

    const initTestSession = (
      testInfo: InfoTest,
      questions: Question[],
      submission?: any,
    ) => {
      setInfoTest(testInfo);
      setQuestions(questions || []);

      /* =========================
       * TH1: ĐÃ HOÀN THÀNH
       * ========================= */
      if (submission?.end_time) {
        setIsDone(true);
        setScore(submission.score);
        setSubmissions(submission.question_submission || {});
        return;
      }

      /* =========================
       * TH2: ĐANG LÀM – CÓ SUBMISSION
       * ========================= */
      if (submission?.start_time) {
        setSubmissions(submission.question_submission || {});

        const endTime = getActualEndTime(
          submission.start_time,
          testInfo.duration_minutes,
          testInfo.end_time,
        );

        timerCleanup = startCountdown(endTime);

        const savedSubmissions = localStorage.getItem(submissionCache);
        if (savedSubmissions) {
          setSubmissions(JSON.parse(savedSubmissions));
        }
        return;
      }


      /* =========================
       * TH3: CHƯA LÀM
       * ========================= */

      const nowISO = new Date().toISOString();

      const endTime = getActualEndTime(
        nowISO,
        testInfo.duration_minutes,
        testInfo.end_time,
      );

      timerCleanup = startCountdown(endTime);

    };

    const fetchQuestions = async () => {
      try {
        setLoading(true);

        /* =========================
         * 1️⃣ ƯU TIÊN CACHE
         * ========================= */
        const cached = localStorage.getItem(questionCache);
        if (cached) {
          const parsed = JSON.parse(cached);
          initTestSession(
            parsed.test_info,
            parsed.questions,
            parsed.submission,
          );
          return;
        }

        /* =========================
         * 2️⃣ GỌI API
         * ========================= */
        const response = await apiCallPost<any>(
          API_ENDPOINTS.START_TEST,
          {
            class_id: classId,
            author_mail: author,
            test_id: testId,
          },
          navigate,
        );

        // 🔐 LƯU CACHE
        localStorage.setItem(
          questionCache,
          JSON.stringify({
            test_info: response.test_info,
            questions: response.questions,
            submission: response.submission,
          }),
        );

        initTestSession(
          response.test_info,
          response.questions,
          response.submission,
        );
      } catch (err) {
        console.error(err);
        setError(t('doTest.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    return () => timerCleanup?.();
  }, [testId, author, classId]);


  const startCountdown = (endTimeISO: string) => {
    const endTime = new Date(endTimeISO).getTime();

    const interval = setInterval(() => {
      const diff = endTime - Date.now();

      if (diff <= 0) {
        clearInterval(interval);

        apiSendTest().then(() => {
          alert(t('doTest.time_up'));
        });

        setCountdownTime({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setCountdownTime({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  };


  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const currentQuestion = questions[currentQuestionIndex];
  const submissionedCount = submissions ? Object.keys(submissions).length : 0;
  const progressPercentage = questions.length ? (submissionedCount / questions.length) * 100 : 0;

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
            {infoTest && infoTest.is_test && (
              <div className="text-lg font-semibold text-red-600">
                {t('doTest.time_remaining')}: {countdownTime.hours}h {countdownTime.minutes}m{' '}
                {countdownTime.seconds}s
              </div>
            )}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-yellow-500 text-sm">{t('doTest.saving')}</span>
              )}
              {saveStatus === 'saved' && <span className="text-green-500 text-sm">{t('doTest.saved')}</span>}
              {saveStatus === 'error' && <span className="text-red-500 text-sm">{t('doTest.save_error')}</span>}
              {isTest && (
                <button
                  onClick={handleSendTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {t('doTest.submit_test')}
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
            {t('doTest.submissioned')}: {submissionedCount}/{questions.length} {t('doTest.questions_count')}
          </div>
        </div>
      )}

      {isDone ? (
        <div className="text-green-700 font-semibold text-xl text-center">
          {t('doTest.score')}: {score}/{totalScore}
        </div>
      ) : null}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.max(i - 1, 0))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="mr-2" /> {t('doTest.previous_question')}
        </button>

        <div className="text-sm text-gray-600 flex items-center">
          {t('question')} {currentQuestionIndex + 1}/{questions.length}
        </div>
        <button className='p-5' onClick={resetTest}> <TfiReload />
        </button>
        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1))}
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {t('doTest.next_question')} <ChevronRight className="ml-2" />
        </button>
      </div>
      {currentQuestion ? (
        <div>
          <QuestionComponent
            question={currentQuestion}
            isDone={isDone}
            showSubmission={showSubmission}
            submission={submissions[currentQuestion._id] || null}
            onSubmissionChange={handleCurrentQuestionSubmissionChange}
            author={author || ''}
          />
        </div>
      ) : null}


      {(!isTest || (isDone && !isTest)) && (
        <div className="flex justify-center items-center">
          <button
            onClick={handleShowSubmission}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 
        ${showSubmission ? 'bg-blue-500 text-white hover:bg-white-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}
      `}
          >
            {showSubmission ? t('doTest.hide_submission') : t('doTest.show_submission')}
          </button>
        </div>
      )}

      {/* Danh sách câu */}
      <div className="flex flex-wrap gap-2 mt-4">
        {questions.map((q, i) => {
          // Check if this question has an submission
          const hasSubmission = !!submissions[q._id];

          return (
            <button
              key={q._id}
              onClick={() => setCurrentQuestionIndex(i)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border 
                ${currentQuestionIndex === i
                  ? 'bg-blue-600 text-white'
                  : hasSubmission
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