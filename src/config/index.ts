// ================= BASE URL =================
const API_BASE_URL = 'http://localhost:8080';       // main backend
const API_BASE_URL_DO_TEST = 'http://localhost:3030'; // test service

// ================= API ENDPOINTS =================
const API_ENDPOINTS = {
  // ========= AUTH / USER =========
  GOOGLE_LOGIN: `${API_BASE_URL}/api/google/login`,
  USERS: `${API_BASE_URL}/users`,

  // ========= HOST / TEACHER =========
  TESTS: `${API_BASE_URL}/tests`,
  CLASSES: `${API_BASE_URL}/class`,
  GENERATE_CLASS_CODE: `${API_BASE_URL}/codeclass`,
  QUESTIONS: `${API_BASE_URL}/questions`,
  TOPIC: `${API_BASE_URL}/topic`,
  LEVEL: `${API_BASE_URL}/level`,
  TYPE_QUESTION: `${API_BASE_URL}/type-question`,
  RESET_TEST: `${API_BASE_URL}/class/reset-test`,


  // ========= STUDENT =========
  JOIN_CLASS: `${API_BASE_URL}/class/joinclass`,

  // ========= TEST PROCESS =========
  STUDENT_CLASSES: `${API_BASE_URL_DO_TEST}/class-test/get-class`,
  GET_TESTS_OF_CLASS: `${API_BASE_URL_DO_TEST}/class-test/get-test-of-class`,
  START_TEST: `${API_BASE_URL_DO_TEST}/test-process/start`,
  SUBMIT_TEST: `${API_BASE_URL_DO_TEST}/test-process/submit`,

  // ========= FILE / S3 =========

  DOWNLOAD: `${API_BASE_URL}/files/presign-download`,
  UPLOAD: `${API_BASE_URL}/files/presign-upload`,
  ALLFILE: `${API_BASE_URL}/files/get-files`,

  USER: `${API_BASE_URL}/user`,

  USER_ME: `${API_BASE_URL}/user/me`,

  EXPORT_SUBMISSION_PDF: `${API_BASE_URL}/submissions/export/pdf`


};

export default API_ENDPOINTS;
