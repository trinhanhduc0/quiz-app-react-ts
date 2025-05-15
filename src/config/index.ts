// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL_LOGIN = 'http://localhost:8081';
const API_BASE_URL_DO_TEST = 'http://localhost:8082';

const API_ENDPOINTS = {
  GOOGLE_LOGIN: `${API_BASE_URL_LOGIN}/auth/google/login`,
  USER_API: `${API_BASE_URL}/users`,

  STUDENT_CLASSES: `${API_BASE_URL}/getclass`,

  TESTS: `${API_BASE_URL}/tests`,
  GETTESTS: `${API_BASE_URL}/tests/class`,
  SENDTEST: `${API_BASE_URL_DO_TEST}/answers/submit-test`,

  GETQUESTIONS: `${API_BASE_URL_DO_TEST}/class-test/get-question-of-test`,

  CLASSES: `${API_BASE_URL}/class`,

  JOINCLASS: `${API_BASE_URL}/class/joinclass`,
  GENERATECODE: `${API_BASE_URL}/codeclass`,

  QUESTIONS: `${API_BASE_URL}/questions`,

  IMAGE: `${API_BASE_URL}/getfile`,
  GETIMAGEFILES: `${API_BASE_URL}/getallimagefile`,
  IMAGE_AUTHOR: `${API_BASE_URL}/getallfile`,
  UPLOAD_IMAGE: `${API_BASE_URL}/upfile`,
};

export default API_ENDPOINTS;
