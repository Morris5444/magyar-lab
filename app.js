// MagyarLab – Ungarisch lernen
//
// Dieses Skript implementiert eine einfache einseitige Webanwendung zum
// Ungarischlernen. Es enthält ein Onboarding, ein Dashboard, Lektionen
// (mit Beispielen und Übungsfragen), einen Vokabeltrainer basierend auf
// einem sehr einfachen Spaced-Repetition-System und einen kleinen
// Prüfungs-Demo-Modus. Die Daten werden in localStorage gespeichert,
// sodass sie zwischen Sessions erhalten bleiben.

(() => {
  const app = document.getElementById('app');

  // Beispielhafte Lektionen. In einer echten Anwendung würde diese Liste
  // viel umfangreicher sein und bis zu C2 reichen. Hier sind nur wenige
  // demonstrative Einträge enthalten.
  const lessons = [
    {
      id: 1,
      level: 'A1',
      title: 'Lektion 1: Begrüßung und „van”',
      explanation:
        'Im Ungarischen wird das Wort „van” verwendet, um Existenz oder Position auszudrücken. Im Präsens wird das Verb „sein” bei einfachen Sätzen oft weggelassen.',
      examples: [
        { hu: 'Szia!', de: 'Hallo!' },
        { hu: 'Jó napot!', de: 'Guten Tag!' },
        { hu: 'Hogy vagy?', de: 'Wie geht es dir?' }
      ],
      exercises: [
        {
          question: 'Wie sagt man „Guten Abend” auf Ungarisch?',
          options: ['Jó reggelt!', 'Jó estét!', 'Jó éjszakát!'],
          answer: 1
        },
        {
          question: 'Wie sagt man „Wie geht es dir?” auf Ungarisch?',
          options: ['Hogy vagy?', 'Viszontlátásra!', 'Köszönöm!'],
          answer: 0
        }
      ],
      vocabulary: [
        { word: 'szia', translation: 'hallo' },
        { word: 'jó', translation: 'gut' },
        { word: 'nap', translation: 'Tag' },
        { word: 'est', translation: 'Abend' }
      ]
    },
    {
      id: 2,
      level: 'A1',
      title: 'Lektion 2: Zahlen und Uhrzeit',
      explanation:
        'Zahlen werden im Ungarischen nach dem Dezimalsystem gebildet. Die Uhrzeit wird mit dem Wort „óra” (Stunde) angegeben.',
      examples: [
        { hu: 'egy', de: 'eins' },
        { hu: 'kettő', de: 'zwei' },
        { hu: 'három', de: 'drei' },
        { hu: 'Tíz óra van.', de: 'Es ist zehn Uhr.' }
      ],
      exercises: [
        {
          question: 'Was bedeutet „három”?',
          options: ['drei', 'vier', 'acht'],
          answer: 0
        },
        {
          question: 'Wie sagt man „Es ist sieben Uhr” auf Ungarisch?',
          options: ['Öt óra van.', 'Hét óra van.', 'Kilenc óra van.'],
          answer: 1
        }
      ],
      vocabulary: [
        { word: 'egy', translation: 'eins' },
        { word: 'kettő', translation: 'zwei' },
        { word: 'három', translation: 'drei' },
        { word: 'négy', translation: 'vier' }
      ]
    },
    {
      id: 3,
      level: 'A1',
      title: 'Lektion 3: Familie und Freunde',
      explanation:
        'Verwandtschaftsbezeichnungen und Begriffe für Freunde werden häufig gebraucht. Beachte die Possessivsuffixe bei Familienzugehörigkeit.',
      examples: [
        { hu: 'anya', de: 'Mutter' },
        { hu: 'apa', de: 'Vater' },
        { hu: 'barát', de: 'Freund' },
        { hu: 'testvér', de: 'Geschwister' }
      ],
      exercises: [
        {
          question: 'Was bedeutet „anya”?',
          options: ['Tante', 'Mutter', 'Oma'],
          answer: 1
        },
        {
          question: 'Wie sagt man „Freund” auf Ungarisch?',
          options: ['barát', 'barátnő', 'ellenség'],
          answer: 0
        }
      ],
      vocabulary: [
        { word: 'anya', translation: 'Mutter' },
        { word: 'apa', translation: 'Vater' },
        { word: 'barát', translation: 'Freund' },
        { word: 'barátnő', translation: 'Freundin' }
      ]
    }
  ];

  // Lade gespeicherte Einstellungen oder null
  let settings = JSON.parse(localStorage.getItem('ml-settings')) || null;

  function saveSettings(data) {
    settings = data;
    localStorage.setItem('ml-settings', JSON.stringify(settings));
  }

  function onboardingView() {
    app.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h1>Willkommen bei MagyarLab</h1>
      <p>Bitte wähle deine Präferenzen, um dein Lernprogramm zu starten.</p>
      <div class="input-group">
        <label>Niveau:</label>
        ${['A1','A2','B1','B2','C1','C2']
          .map(
            (l) => `
          <label><input type="radio" name="level" value="${l}" /> ${l}</label>`
          )
          .join('')}
      </div>
      <div class="input-group">
        <label>Fokus:</label>
        ${['Grammatik','Situationen','Beides']
          .map(
            (f) => `
          <label><input type="radio" name="focus" value="${f.toLowerCase()}" /> ${f}</label>`
          )
          .join('')}
      </div>
      <div class="input-group">
        <label>Modus:</label>
        ${['Selbstlernen','Unterricht']
          .map(
            (m) => `
          <label><input type="radio" name="mode" value="${m.toLowerCase()}" /> ${m}</label>`
          )
          .join('')}
      </div>
      <div class="input-group">
        <label><input type="checkbox" name="examPrep" /> Prüfungsvorbereitung (ECL/TELC)</label>
      </div>
      <button id="startBtn">Starten</button>
    `;
    app.appendChild(card);
    card.querySelector('#startBtn').addEventListener('click', () => {
      const level = card.querySelector('input[name="level"]:checked');
      const focus = card.querySelector('input[name="focus"]:checked');
      const mode = card.querySelector('input[name="mode"]:checked');
      const examPrep = card.querySelector('input[name="examPrep"]').checked;
      if (!level || !focus || !mode) {
        alert('Bitte alle Felder auswählen.');
        return;
      }
      saveSettings({
        level: level.value,
        focus: focus.value,
        mode: mode.value,
        examPrep
      });
      render();
    });
  }

  function getLessonList() {
    if (!settings) return [];
    // Für eine einfache Demo filtern wir nur A1-Lektionen. In einer echten
    // Anwendung sollten hier alle passenden Lektionen nach Niveau und Fokus
    // zurückgegeben werden.
    return lessons.filter((l) => l.level === settings.level);
  }

  function dashboardView() {
    app.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h1>MagyarLab Dashboard</h1>
      <p>Hallo! Du lernst auf Niveau ${settings.level} (${settings.mode}).</p>
      <h2>Lektionen</h2>
      <ul class="lesson-list">
        ${getLessonList()
          .map((l) => `<li><button class="lesson-btn" data-id="${l.id}">${l.title}</button></li>`)
          .join('')}
      </ul>
      <h2>Vokabeltrainer</h2>
      <p><button id="vocabBtn">Trainer öffnen</button></p>
      ${
        settings.examPrep
          ? '<h2>Prüfungsvorbereitung</h2><p><button id="examBtn">Prüfungs-Demo</button></p>'
          : ''
      }
      <p style="margin-top:1rem;"><button id="resetBtn">Einstellungen zurücksetzen</button></p>
    `;
    app.appendChild(card);
    card.querySelectorAll('.lesson-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        lessonView(id);
      });
    });
    card.querySelector('#vocabBtn').addEventListener('click', vocabTrainerView);
    if (settings.examPrep) {
      card.querySelector('#examBtn').addEventListener('click', examView);
    }
    card.querySelector('#resetBtn').addEventListener('click', () => {
      localStorage.removeItem('ml-settings');
      settings = null;
      render();
    });
  }

  function lessonView(id) {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) {
      render();
      return;
    }
    app.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    // Beispiele
    let examplesHTML = '';
    lesson.examples.forEach((ex, i) => {
      examplesHTML += `
        <p><strong>${ex.hu}</strong> – ${ex.de} <button data-idx="${i}" class="speak-btn">🔊</button></p>
      `;
    });
    // Übungen
    let exercisesHTML = '';
    lesson.exercises.forEach((ex, i) => {
      exercisesHTML += `
        <div class="exercise" data-ex="${i}">
          <p><strong>${ex.question}</strong></p>
          <ul class="options">
            ${ex.options
              .map(
                (opt, j) => `<li><label><input type="radio" name="ex-${i}" value="${j}" /> ${opt}</label></li>`
              )
              .join('')}
          </ul>
          <button class="check-ex-btn">Prüfen</button>
          <span class="ex-feedback"></span>
        </div>
      `;
    });
    card.innerHTML = `
      <h2>${lesson.title}</h2>
      <p>${lesson.explanation}</p>
      <h3>Beispiele</h3>
      ${examplesHTML}
      <h3>Übungen</h3>
      ${exercisesHTML}
      <p><button id="addVocabBtn">Vokabeln hinzufügen</button></p>
      <p><button id="backBtn">Zurück</button></p>
    `;
    app.appendChild(card);
    // Aussprache abspielen
    card.querySelectorAll('.speak-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-idx'));
        speak(lesson.examples[idx].hu);
      });
    });
    // Übungen prüfen
    card.querySelectorAll('.check-ex-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exEl = btn.closest('.exercise');
        const exIdx = Number(exEl.getAttribute('data-ex'));
        const input = exEl.querySelector(`input[name="ex-${exIdx}"]:checked`);
        const feedbackEl = exEl.querySelector('.ex-feedback');
        if (!input) {
          feedbackEl.textContent = 'Bitte eine Antwort wählen.';
          feedbackEl.style.color = '#dc3545';
          return;
        }
        const selected = Number(input.value);
        const correct = lesson.exercises[exIdx].answer;
        if (selected === correct) {
          feedbackEl.textContent = 'Richtig!';
          feedbackEl.style.color = '#28a745';
        } else {
          feedbackEl.textContent = 'Falsch, versuche es nochmal.';
          feedbackEl.style.color = '#dc3545';
        }
      });
    });
    // Vokabeln hinzufügen
    card.querySelector('#addVocabBtn').addEventListener('click', () => {
      addVocabList(lesson.vocabulary);
      alert('Vokabeln wurden zur Wiederholungsliste hinzugefügt.');
    });
    // Zurück zum Dashboard
    card.querySelector('#backBtn').addEventListener('click', render);
  }

  // Funktionen für das Spaced-Repetition-System
  function getVocab() {
    return JSON.parse(localStorage.getItem('ml-vocab') || '[]');
  }
  function saveVocab(list) {
    localStorage.setItem('ml-vocab', JSON.stringify(list));
  }
  function addVocabList(list) {
    const existing = getVocab();
    list.forEach((item) => {
      const existingItem = existing.find((e) => e.word === item.word);
      if (!existingItem) {
        existing.push({ ...item, interval: 1, due: Date.now() });
      }
    });
    saveVocab(existing);
  }
  function updateVocab(item, ease) {
    let inc;
    switch (ease) {
      case 'again':
        inc = 1;
        break;
      case 'hard':
        inc = 2;
        break;
      case 'good':
        inc = 3;
        break;
      case 'easy':
        inc = 5;
        break;
      default:
        inc = 1;
    }
    item.interval = Math.max(1, item.interval + inc);
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + item.interval);
    item.due = nextDue.getTime();
  }

  function vocabTrainerView() {
    app.innerHTML = '';
    const vocabList = getVocab().sort((a, b) => a.due - b.due);
    const dueNow = vocabList.filter((v) => v.due <= Date.now());
    const card = document.createElement('div');
    card.className = 'card';
    if (dueNow.length === 0) {
      card.innerHTML = `
        <h2>Vokabeltrainer</h2>
        <p>Keine Vokabeln zur Wiederholung fällig.</p>
        <p><button id="backBtn">Zurück</button></p>
      `;
      app.appendChild(card);
      card.querySelector('#backBtn').addEventListener('click', render);
      return;
    }
    const item = dueNow[0];
    card.innerHTML = `
      <h2>Vokabeltrainer</h2>
      <p><strong>${item.word}</strong></p>
      <p>${item.translation}</p>
      <div>
        <button id="againBtn">Nochmal</button>
        <button id="hardBtn">Schwer</button>
        <button id="goodBtn">Gut</button>
        <button id="easyBtn">Leicht</button>
      </div>
      <p><button id="backBtn">Zurück</button></p>
    `;
    app.appendChild(card);
    card.querySelector('#againBtn').addEventListener('click', () => {
      updateVocab(item, 'again');
      saveVocab(vocabList);
      vocabTrainerView();
    });
    card.querySelector('#hardBtn').addEventListener('click', () => {
      updateVocab(item, 'hard');
      saveVocab(vocabList);
      vocabTrainerView();
    });
    card.querySelector('#goodBtn').addEventListener('click', () => {
      updateVocab(item, 'good');
      saveVocab(vocabList);
      vocabTrainerView();
    });
    card.querySelector('#easyBtn').addEventListener('click', () => {
      updateVocab(item, 'easy');
      saveVocab(vocabList);
      vocabTrainerView();
    });
    card.querySelector('#backBtn').addEventListener('click', render);
  }

  function examView() {
    app.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>Prüfungs-Demo (B1)</h2>
      <h3>Lesen</h3>
      <p>Lesen Sie den Text und beantworten Sie die Frage.</p>
      <p><em>„Péter Budapesten lakik. Minden reggel kávét iszik, és vonattal megy a munkába.”</em></p>
      <p>Wo lebt Péter?</p>
      <ul class="options">
        <li><label><input type="radio" name="readQ" value="0" /> Debrecen</label></li>
        <li><label><input type="radio" name="readQ" value="1" /> Budapest</label></li>
        <li><label><input type="radio" name="readQ" value="2" /> Szeged</label></li>
      </ul>
      <span id="readFeedback"></span>
      <h3>Hören</h3>
      <p>Hören Sie das folgende Wort. Was bedeutet es?</p>
      <p><button id="listenBtn">🔊 Abspielen</button></p>
      <ul class="options">
        <li><label><input type="radio" name="listenQ" value="0" /> Tisch</label></li>
        <li><label><input type="radio" name="listenQ" value="1" /> Haus</label></li>
        <li><label><input type="radio" name="listenQ" value="2" /> Freund</label></li>
      </ul>
      <span id="listenFeedback"></span>
      <h3>Lückentext</h3>
      <p>„Én ____ (menni) a boltba.” – Wählen Sie die richtige Form.</p>
      <ul class="options">
        <li><label><input type="radio" name="clozeQ" value="0" /> megyek</label></li>
        <li><label><input type="radio" name="clozeQ" value="1" /> megy</label></li>
        <li><label><input type="radio" name="clozeQ" value="2" /> mennek</label></li>
      </ul>
      <span id="clozeFeedback"></span>
      <p><button id="submitExamBtn">Prüfen</button></p>
      <p><button id="backBtn">Zurück</button></p>
    `;
    app.appendChild(card);
    const listenWord = 'asztal';
    card.querySelector('#listenBtn').addEventListener('click', () => speak(listenWord));
    card.querySelector('#submitExamBtn').addEventListener('click', () => {
      const readAnswer = Number(card.querySelector('input[name="readQ"]:checked')?.value);
      const listenAnswer = Number(card.querySelector('input[name="listenQ"]:checked')?.value);
      const clozeAnswer = Number(card.querySelector('input[name="clozeQ"]:checked')?.value);
      const readFb = card.querySelector('#readFeedback');
      const listenFb = card.querySelector('#listenFeedback');
      const clozeFb = card.querySelector('#clozeFeedback');
      readFb.textContent = readAnswer === 1 ? 'Richtig!' : 'Falsch.';
      readFb.style.color = readAnswer === 1 ? '#28a745' : '#dc3545';
      listenFb.textContent = listenAnswer === 0 ? 'Richtig!' : 'Falsch.';
      listenFb.style.color = listenAnswer === 0 ? '#28a745' : '#dc3545';
      clozeFb.textContent = clozeAnswer === 0 ? 'Richtig!' : 'Falsch.';
      clozeFb.style.color = clozeAnswer === 0 ? '#28a745' : '#dc3545';
    });
    card.querySelector('#backBtn').addEventListener('click', render);
  }

  // Text-to-Speech-Funktion für ungarische Aussprache
  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hu-HU';
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  }

  function render() {
    if (!settings) {
      onboardingView();
    } else {
      dashboardView();
    }
  }

  render();
})();