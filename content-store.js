// Темы из репозитория и персональные изменения в этом браузере.
(function () {
  'use strict';

  const catalog = new Map();
  const storageKey = subject => 'doro.localTopics.v1.' + subject;
  const sameNumber = (a, b) => String(a) === String(b);
  function getSubject(key) {
    const subject = window.subjects[key];
    if (!subject) throw new Error('Предмет не найден');
    if (!catalog.has(key)) catalog.set(key, subject.topics.slice());
    return subject;
  }

  function readChanges(key) {
    return JSON.parse(localStorage.getItem(storageKey(key)) || '[]');
  }

  function applyChanges(key, changes) {
    const subject = getSubject(key);
    const topics = catalog.get(key).slice();
    for (const change of changes) {
      const index = topics.findIndex(topic => sameNumber(topic.num, change.num));
      if (change.deleted) {
        if (index >= 0) topics.splice(index, 1);
      } else if (index >= 0) {
        topics[index] = { ...topics[index], ...change };
      } else {
        topics.push(change);
      }
    }
    subject.topics = topics;
  }

  function saveChanges(key, updates) {
    const changes = readChanges(key).filter(topic =>
      !updates.some(update => sameNumber(update.num, topic.num))
    ).concat(updates);
    localStorage.setItem(storageKey(key), JSON.stringify(changes));
    applyChanges(key, changes);
  }

  function checkNumber(key, num) {
    if (getSubject(key).topics.some(topic => sameNumber(topic.num, num))) {
      throw new Error('Тема с таким номером уже есть');
    }
  }

  function localTopic(data) {
    return { ...data, date: formatDateForDb(data.date), pdf: data.pdfFiles?.[0] || null };
  }

  // Преобразует ДД.ММ.ГГГГ или ДД-ММ-ГГГГ в 2026-11-10 (для базы и календаря)
  function formatDateForDb(dateStr) {
    if (!dateStr) return '';
    // Если дата уже в формате ГГГГ-ММ-ДД (с дефисами), просто возвращаем её
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      return dateStr.trim();
    }
    // Иначе парсим как ДД.ММ.ГГГГ
    const parts = dateStr.trim().split(/[\.\-\/]/);
    if (parts.length === 3) {
      const dd = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      let yyyy = parts[2];
      if (yyyy.length === 2) yyyy = '20' + yyyy;
      return `${yyyy}-${mm}-${dd}`;
    }
    return dateStr;
  }

  // Преобразует 2026-11-10 в 10.11.2026 (для показа в форме)
  function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  }

  window.doroContent = {
    async loadAllTopics() {
      for (const key of Object.keys(window.subjects)) applyChanges(key, readChanges(key));
    },

    async loadTopicContent(topic) {
      if (typeof topic.content === 'string') return topic.content;
      if (!topic.file) return '<p class="reader__empty">Файл темы пуст.</p>';
      const response = await fetch(topic.file);
      if (!response.ok) throw new Error('Не удалось загрузить тему: ' + response.status);
      return response.text();
    },

    async createTopic(key, data) {
      checkNumber(key, data.num);
      saveChanges(key, [localTopic(data)]);
      return key + '_' + data.num;
    },

    async updateTopic(key, oldNum, data) {
      const updates = [];
      if (!sameNumber(oldNum, data.num)) {
        checkNumber(key, data.num);
        updates.push({ num: oldNum, deleted: true });
      }
      const previous = getSubject(key).topics.find(topic => sameNumber(topic.num, oldNum));
      updates.push({ ...previous, ...localTopic(data) });
      saveChanges(key, updates);
      return key + '_' + data.num;
    },

    async deleteTopic(key, num) {
      saveChanges(key, [{ num, deleted: true }]);
      return true;
    },

    formatDateForInput
  };
})();
