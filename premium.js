// Локальная версия открывает все инструменты практики и оформления.
(function () {
  'use strict';

  const attemptsKey = 'doro.quizAttempts.v1';

  function readAttempts() {
    try {
      return JSON.parse(localStorage.getItem(attemptsKey)) || {};
    } catch {
      return {};
    }
  }

  window.doroPremium = {
    isPremiumActive: () => true,
    readPremium: () => ({ active: true }),
    canStartQuiz: () => true,
    quizAttemptsLeft: () => Infinity,
    quizAttemptsLabel: () => 'Без лимита',
    getQuizAttempts: key => readAttempts()[key] || 0,
    addQuizAttempt(key) {
      const attempts = readAttempts();
      attempts[key] = (attempts[key] || 0) + 1;
      localStorage.setItem(attemptsKey, JSON.stringify(attempts));
    }
  };
})();
