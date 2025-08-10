// MagyarLab – Static SPA (vanilla JS, no build tools)
(function () {
  const LS_KEY = "magyarlab-v1-state";

  const state = loadState() || {
    profile: {
      audience: "de",
      level: null,          // <= Nur noch Niveau
      examPrep: false,      // Prüfungsmodus-Schalter bleibt über Einstellungen
      audio: { slow: true, normal: true },
      allowOffline: true,
      feedback: true,
    },
    progress: {
      completedLessons: {},
      scores: {},
      levelByTrack: {},
    },
    srs: {}, // vocabId -> { reps, interval, ease, due }
    ui: { tab: "lessons", route: "onboarding", lessonId: null }, // nach Onboarding direkt "lessons"
    todayPlan: [],
  };

  // ---------- Curriculum ----------
  // A1 aus der ersten Version bleibt (gekürzt auf die bisherigen 12 Units),
  // B2 neu hinzugefügt (Themen aus deinen Bildern, neu formuliert).
  const CURRICULUM = {
    /* --- bestehendes A1 (ausgelassen hier NICHT, wir geben einige Units,
       du hattest sie schon in v1. Wenn du 1:1 deine alte A1 möchtest,
       lass diese A1-Sektion stehen; ich fokussiere unten auf B2. --- */
    A1: [
      {
        id: "a1-u1",
        title: "Begrüßen & Vorstellen – Van (sein)",
        grammar: [
          { name: "Personalpronomen (én, te, ő…)" },
          { name: "Kopulaverb *van* – Präsens, Auslassungen" },
          { name: "Fragepartikel *-e*" },
        ],
        examples: [
          { hu: "Szia! Jó napot!", de: "Hi! Guten Tag!" },
          { hu: "Péter vagyok. És te?", de: "Ich bin Péter. Und du?" },
          { hu: "Ő tanár?", de: "Ist er/sie Lehrer/in?" },
        ],
        exercises: [
          {
            type: "gap",
            prompt: "Setze *van* richtig ein:",
            items: [
              { q: "Éva ____ diák.", a: "Éva diák.", help: "Im Aussagesatz fällt *van* in 3. Sg. oft weg." },
              { q: "Péter és Anna ____ otthon?", a: "Péter és Anna otthon vannak?" },
              { q: "Ez ____ könyv?", a: "Ez könyv?" },
            ],
          },
          {
            type: "mc",
            prompt: "Wähle die korrekte Begrüßung für den Abend:",
            options: ["Jó reggelt!", "Jó estét!", "Viszlát!"],
            answer: 1,
          },
        ],
        vocab: [
          { id: "szia", hu: "Szia!", de: "Hi!" },
          { id: "jo_napot", hu: "Jó napot!", de: "Guten Tag!" },
          { id: "koszonom", hu: "Köszönöm", de: "Danke" },
          { id: "igen", hu: "Igen", de: "Ja" },
          { id: "nem", hu: "Nem", de: "Nein" },
        ],
      },
      // ... (deine bisherigen A1-Lektionen aus v1 bleiben unverändert)
    ],

    /* ---------------- B2: neue Lektionen (aus deinen Bildern, neu geschrieben) --------------- */
    B2: [
      /* 01 */{
        id: "b2-u1",
        title: "Vokalharmonie (2): richtige Endung wählen",
        grammar: [
          { name: "Front-/Back-/Gemischte Wörter (recap & edge cases)" },
          { name: "Bindevokale bei Suffixen (-o/-e, -a/-e, -ban/-ben, -hoz/-hez/-höz…)" },
          { name: "Zusammengesetzte Wörter: letzte Wurzel entscheidet" },
        ],
        examples: [
          { hu: "A könyvben jegyzetel.", de: "Er/sie schreibt im Buch Notizen." },
          { hu: "A teraszról telefonálok.", de: "Ich telefoniere von der Terrasse." },
          { hu: "A tanárhoz megyünk.", de: "Wir gehen zum Lehrer." },
        ],
        exercises: [
          { type: "match", prompt: "Ordne Stamm + Suffix (nach Vokalharmonie):",
            pairs: [
              { left: "kert", right: "ben" },
              { left: "bolt", right: "ban" },
              { left: "orvos", right: "hoz" },
              { left: "nővér", right: "hez" },
            ]
          },
          { type: "gap", prompt: "Setze die passende Richtungsendung ein:",
            items: [
              { q: "Bemegyek a szobá__.", a: "szobába" },
              { q: "Kijövök a ház__.", a: "házból" },
              { q: "Felmegyek az emelet__.", a: "emeletre" },
              { q: "Lejövök az emelet__.", a: "emeletről" },
            ]
          }
        ],
        vocab: [
          { id: "terasz", hu: "terasz", de: "Terrasse" },
          { id: "jegyzetel", hu: "jegyzetel", de: "Notizen machen" },
          { id: "emelet", hu: "emelet", de: "Stockwerk" },
        ],
      },

      /* 02 */{
        id: "b2-u2",
        title: "Indefinit oder Definit? – Objekt & Artikel",
        grammar: [
          { name: "Kein direktes Objekt → indefinit" },
          { name: "Unbestimmter Artikel / Quantor → meist indefinit" },
          { name: "Bestimmter Artikel / Pronomen → definitiv" },
        ],
        examples: [
          { hu: "Olvasok egy könyvet.", de: "Ich lese ein Buch. (indef.)" },
          { hu: "Olvasom a könyvet.", de: "Ich lese das Buch. (def.)" },
          { hu: "Kérem a számlát.", de: "Ich bitte um die Rechnung. (def.)" },
        ],
        exercises: [
          { type: "mc", prompt: "Wähle *indefinit* oder *definit*:",
            options: ["Látok egy autót.", "Látom az autót.", "Veszek kenyeret."],
            answer: 1
          },
          { type: "gap", prompt: "Setze die richtige Verbform (indef./def.):",
            items: [
              { q: "Én ____ (néz) a filmet.", a: "nézem" },
              { q: "Mi ____ (vesz) egy új asztalt.", a: "veszünk" },
              { q: "Ő ____ (keres) a kulcsot.", a: "keresi" },
              { q: "Ti ____ (ír) e-maileket.", a: "írtok" },
            ]
          }
        ],
        vocab: [
          { id: "szamla", hu: "számla", de: "Rechnung" },
          { id: "kulcs", hu: "kulcs", de: "Schlüssel" },
        ],
      },

      /* 03 */{
        id: "b2-u3",
        title: "Präsens, definite (1): regelmäßige Verben",
        grammar: [
          { name: "Personalsuffixe für def. Präsens (-om/-em/-öm, -od/-ed/-öd …)" },
          { name: "Stamm + beibehaltene Konsonanten" },
        ],
        examples: [
          { hu: "Rajzolom a képet.", de: "Ich zeichne das Bild." },
          { hu: "Szeretjük a filmet.", de: "Wir mögen den Film." },
          { hu: "Ütik a labdát.", de: "Sie schlagen den Ball." },
        ],
        exercises: [
          { type: "gap", prompt: "Konjugiere im def. Präsens:",
            items: [
              { q: "én ____ (néz) a meccset", a: "nézem" },
              { q: "te ____ (szeret) a zenét", a: "szereted" },
              { q: "ő ____ (küld) az e-mailt", a: "küldi" },
              { q: "mi ____ (rajzol) a térképet", a: "rajzoljuk" },
              { q: "ti ____ (olvas) a cikket", a: "olvassátok" },
              { q: "ők ____ (fizet) a számlát", a: "fizetik" },
            ]
          }
        ],
        vocab: [
          { id: "rajzol", hu: "rajzol", de: "zeichnen" },
          { id: "kuldo", hu: "küld", de: "schicken" },
        ],
      },

      /* 04 */{
        id: "b2-u4",
        title: "Präsens, definite (2): -s/-sz/-z-Stämme & Lautanpassung",
        grammar: [
          { name: "Assimilation: s/sz/z + j → ss/ssz/zz (pl. *keres* → *keresed*)" },
          { name: "Vokalharmonie bei -od/-ed/-öd" },
        ],
        examples: [
          { hu: "Keresem a kulcsot.", de: "Ich suche den Schlüssel." },
          { hu: "Hozzátok a táskát?", de: "Bringt ihr die Tasche?" },
          { hu: "Főzzük a levest.", de: "Wir kochen die Suppe." },
        ],
        exercises: [
          { type: "gap", prompt: "Bilde die def. Präsensformen:",
            items: [
              { q: "én ____ (hoz) a könyvet", a: "hozom" },
              { q: "te ____ (keres) a pénztárcát", a: "keresed" },
              { q: "ő ____ (főz) a kávét", a: "főzi" },
              { q: "mi ____ (néz) a filmet", a: "nézzük" },
              { q: "ti ____ (hoz) a széket", a: "hozzátok" },
              { q: "ők ____ (keres) a jegyeket", a: "keresik" },
            ]
          }
        ],
        vocab: [
          { id: "keres", hu: "keres", de: "suchen" },
          { id: "hoz", hu: "hoz", de: "bringen" },
          { id: "foz", hu: "főz", de: "kochen" },
        ],
      },

      /* 05 */{
        id: "b2-u5",
        title: "Spezial: -ik-Verben & Definitheit",
        grammar: [
          { name: "-ik-Verben sind oft intransitiv → i. d. R. keine def. Konjugation" },
          { name: "Pragmatische Auswahl: Objekt vorhanden? Dann nicht -ik-Verb nehmen" },
        ],
        examples: [
          { hu: "Alszom. / *Alszom a könyvet.*", de: "Ich schlafe. / *(ungrammatisch)*" },
          { hu: "Érdekel a téma.", de: "Das Thema interessiert mich." },
          { hu: "Tetszik a film.", de: "Der Film gefällt mir." },
        ],
        exercises: [
          { type: "mc", prompt: "Wähle die korrekte Variante:",
            options: [
              "Alszom a filmet.",
              "Alszom.",
              "Alszom a könyvet.",
            ],
            answer: 1
          },
          { type: "gap", prompt: "Ersetze, falls nötig, durch ein passendes Verb:",
            items: [
              { q: "*Mosakszom a tányért.* → ____", a: "Mosom a tányért." },
              { q: "____ (tetszik) a dal.", a: "Tetszik a dal." },
              { q: "____ (érdekel) a téma.", a: "Érdekel a téma." },
            ]
          }
        ],
        vocab: [
          { id: "erdekel", hu: "érdekel", de: "interessieren" },
          { id: "tetszik", hu: "tetszik", de: "gefallen" },
        ],
      },

      /* 06 */{
        id: "b2-u6",
        title: "Unregelmäßig (1): eszik/iszik/tesz/vesz/visz (def.)",
        grammar: [
          { name: "Stammwechsel & Doppel-s: eszi/esszük; issza/isszuk; teszi/teszed… " },
          { name: "Objekt als Auslöser für definit" },
        ],
        examples: [
          { hu: "Esszük a levest.", de: "Wir essen die Suppe." },
          { hu: "Isszátok a teát?", de: "Trinkt ihr den Tee?" },
          { hu: "Veszem a kabátot.", de: "Ich nehme den Mantel." },
        ],
        exercises: [
          { type: "gap", prompt: "Setze die def. Form:",
            items: [
              { q: "én ____ (eszik) a pizzát", a: "eszem / eszem a pizzát" },
              { q: "ő ____ (iszik) a kávét", a: "issza" },
              { q: "mi ____ (tenni) a csomagot az asztalra", a: "tesszük" },
              { q: "ti ____ (venni) a jegyeket", a: "veszitek" },
            ]
          }
        ],
        vocab: [
          { id: "esz", hu: "eszik", de: "essen" },
          { id: "iszik", hu: "iszik", de: "trinken" },
          { id: "vesz", hu: "vesz", de: "nehmen/kaufen" },
        ],
      },

      /* 07 */{
        id: "b2-u7",
        title: "Unregelmäßig (2): Vokalverlustverben",
        grammar: [
          { name: "z. B. javasol/javasolja; érez/érzi; közöl/közli; őriz/őrzi…" },
          { name: "In 1. Sg. oft -om/-em, 3. Sg. def. Stamm + -ja/-i" },
        ],
        examples: [
          { hu: "Javaslom a változást.", de: "Ich schlage die Änderung vor." },
          { hu: "Érzi a különbséget.", de: "Er/Sie spürt den Unterschied." },
          { hu: "Közlik a hírt.", de: "Sie teilen die Nachricht mit." },
        ],
        exercises: [
          { type: "gap", prompt: "Bilde die Form (def.):",
            items: [
              { q: "én ____ (javasol) a tervet", a: "javaslom" },
              { q: "ő ____ (érez) a fájdalmat", a: "érzi" },
              { q: "ők ____ (közöl) a döntést", a: "közlik" },
            ]
          }
        ],
        vocab: [
          { id: "javasol", hu: "javasol", de: "vorschlagen" },
          { id: "erez", hu: "érez", de: "fühlen" },
          { id: "kozl", hu: "közöl", de: "mitteilen" },
        ],
      },

      /* 08 */{
        id: "b2-u8",
        title: "Besonderheiten: mehrere Subjekte, -lak/-lek",
        grammar: [
          { name: "Mehrere Subjekte → Verb oft Sg." },
          { name: "Endung -lak/-lek (én + te/titeket): *Szeretlek.*" },
          { name: "Pronomen als Subjekt meist weglassen" },
        ],
        examples: [
          { hu: "Anya és apa dolgozik.", de: "Mama und Papa arbeiten. (Verb Sg.)" },
          { hu: "Szeretlek.", de: "Ich liebe dich/euch." },
          { hu: "Ismerlek téged.", de: "Ich kenne dich." },
        ],
        exercises: [
          { type: "gap", prompt: "Ergänze korrekt:",
            items: [
              { q: "Én ____ (szeret) téged.", a: "szeretlek" },
              { q: "Anya és apa ____ (főz).", a: "főz" },
              { q: "Mi ____ (ismer) titeket.", a: "ismerünk titeket / ismerünk benneteket" },
            ]
          }
        ],
        vocab: [
          { id: "szeretlek", hu: "szeretlek", de: "ich liebe dich/euch" },
          { id: "ismer", hu: "ismer", de: "kennen" },
        ],
      },

      /* 09 */{
        id: "b2-u9",
        title: "Létige (1): Konjugation & Gebrauch",
        grammar: [
          { name: "vagyok, vagy, van, vagyunk, vagytok, vannak" },
          { name: "Orts-/Zustandsangaben, Antworten auf Hol?/Hogy?/Hányan?/Milyenek?" },
        ],
        examples: [
          { hu: "Hol vagy? – A könyvtárban vagyok.", de: "Wo bist du? – Ich bin in der Bibliothek." },
          { hu: "Ők fáradtak.", de: "Sie sind müde." },
        ],
        exercises: [
          { type: "gap", prompt: "Setze *van/vagyok…*:",
            items: [
              { q: "Mi ____ otthon.", a: "vagyunk" },
              { q: "Ti ____ készen?", a: "vagytok" },
              { q: "Péter ____ magyar.", a: "magyar (van fällt aus)" },
            ]
          }
        ],
        vocab: [
          { id: "vagyok", hu: "vagyok", de: "ich bin" },
        ],
      },

      /* 10 */{
        id: "b2-u10",
        title: "Létige (2): Negation – nem, nincs/nincsen",
        grammar: [
          { name: "Vollverneinung mit *nem*" },
          { name: "*nincs/nincsen* (es gibt kein / ist nicht vorhanden)" },
          { name: "Wortstellung: *nem* vor dem finiten Verb" },
        ],
        examples: [
          { hu: "Nem vagyok fáradt.", de: "Ich bin nicht müde." },
          { hu: "A szobában nincs asztal.", de: "Im Zimmer gibt es keinen Tisch." },
        ],
        exercises: [
          { type: "gap", prompt: "Bilde die Negation:",
            items: [
              { q: "Van időm. → ____", a: "Nincs időm." },
              { q: "Magyar vagyok. → ____", a: "Nem vagyok magyar." },
              { q: "A konyhában asztal van. → ____", a: "A konyhában nincs asztal." },
            ]
          }
        ],
        vocab: [
          { id: "nincs", hu: "nincs / nincsen", de: "es gibt nicht/kein" },
        ],
      },

      /* 11 */{
        id: "b2-u11",
        title: "Verbpräfixe (1): Richtung/Bewegung",
        grammar: [
          { name: "be-, ki-, fel-, le-, át-, ide-/oda-, vissza-, körül-" },
          { name: "Trennbarkeit (Fokus/Wortstellung)" },
        ],
        examples: [
          { hu: "Bemegyek a boltba.", de: "Ich gehe in den Laden hinein." },
          { hu: "Kihozza a széket.", de: "Er/Sie bringt den Stuhl heraus." },
          { hu: "Visszaviszem a könyvet.", de: "Ich bringe das Buch zurück." },
        ],
        exercises: [
          { type: "gap", prompt: "Ergänze das passende Präfix:",
            items: [
              { q: "__megyek a terembe. (hinein)", a: "Be" },
              { q: "__veszed a könyvet a polcról? (herunter)", a: "Le" },
              { q: "__viszem a csomagot a postára. (zurück)", a: "Vissza" },
              { q: "__sétál a parkon. (hinüber/quer)", a: "Át" },
            ]
          }
        ],
        vocab: [
          { id: "visszavisz", hu: "visszavisz", de: "zurückbringen" },
        ],
      },

      /* 12 */{
        id: "b2-u12",
        title: "Verbpräfixe (2): Aspekt & Abschluss – meg-, el-",
        grammar: [
          { name: "meg- (Abschluss/Erfolg), el- (Weg-/Fortbewegung oder Start)" },
          { name: "Fokus: Präfix vs. Verb" },
        ],
        examples: [
          { hu: "Megírom az e-mailt.", de: "Ich schreibe die E-Mail fertig." },
          { hu: "Elmegyek az orvoshoz.", de: "Ich gehe (weg) zum Arzt." },
          { hu: "Megnéztük a filmet.", de: "Wir haben den Film zu Ende geschaut." },
        ],
        exercises: [
          { type: "gap", prompt: "Wähle *meg-* oder *el-*:",
            items: [
              { q: "____olvasom a könyvet (zu Ende).", a: "Meg" },
              { q: "____megyünk hétvégén (weg).", a: "El" },
              { q: "____tanulja a leckét (abschließen).", a: "Meg" },
            ]
          }
        ],
        vocab: [
          { id: "megir", hu: "megír", de: "fertigschreiben" },
          { id: "elmegy", hu: "elmegy", de: "weggehen" },
        ],
      },

      /* 13 */{
        id: "b2-u13",
        title: "Review: definit vs. indefinit + Präfixe",
        grammar: [
          { name: "Kombinationsübungen (Objekt + Präfix + Wortstellung)" },
        ],
        examples: [
          { hu: "Felveszem a kabátot.", de: "Ich ziehe den Mantel an." },
          { hu: "Átolvasok egy cikket.", de: "Ich lese einen Artikel (quer/überfliegend)." },
        ],
        exercises: [
          { type: "gap", prompt: "Setze Form + Präfix:",
            items: [
              { q: "Én ____ (venni) a kabátot. (an-)", a: "felveszem" },
              { q: "Mi ____ (olvasni) egy hosszú cikket. (durch-)", a: "átolvasunk egy hosszú cikket" },
              { q: "Ő ____ (vinni) a csomagot a postára. (hin-)", a: "odaviszi a csomagot a postára" },
            ]
          }
        ],
        vocab: [
          { id: "felvesz", hu: "felvesz", de: "annehmen/aufheben/anziehen" },
          { id: "atolvas", hu: "átolvas", de: "durchlesen" },
        ],
      },
    ],
  };

  // --- Prüfungs-Demo (B1 bleibt vorerst)
  const EXAM_SETS = [
    {
      id: "ecl-b1-demo-1",
      level: "B1",
      title: "ECL B1 – Demo Set 1",
      parts: [
        {
          type: "reading",
          title: "Olvasás – rövid hír",
          text: "A városi könyvtár új, ingyenes programot indított középiskolásoknak...",
          questions: [
            { q: "Kinek szól a program?", options: ["Egyetemistáknak","Középiskolásoknak","Óvodásoknak"], answer: 1 },
            { q: "Milyen gyakran találkoznak a résztvevők?", options: ["Hetente","Havonta","Naponta"], answer: 0 },
            { q: "Miért indítanak plusz csoportokat?", options: ["Kevés a jelentkező","Sokan jelentkeztek","Nincs tanár"], answer: 1 },
          ],
        },
        {
          type: "listening",
          title: "Hallás utáni értés – hirdetés",
          audioText: "Figyelem! Jövő héten nyit a városi sportközpont új uszodája...",
          questions: [
            { q: "Mikor nyit a pénztár?", options: ["7-kor","8-kor","9-kor"], answer: 1 },
            { q: "Mi ingyenes a nyitónapon?", options: ["Az uszoda belépő","A tanmedence és az edzőterem kipróbálása","A bérletek"], answer: 1 },
            { q: "Mit tanácsolnak a látogatóknak?", options: ["Később érkezzenek","Korábban érkezzenek","Ne jöjjenek"], answer: 1 },
          ],
        },
        {
          type: "use",
          title: "Nyelvhasználat – hiányos szöveg",
          instructions: "Egészítsd ki a mondatokat a megfelelő alakokkal.",
          gaps: [
            { q: "A könyvtár___ (-ban/-ben) sok új könyv van.", a: "ban" },
            { q: "Hol ____ (lehet/kell/tud) parkolni?", a: "lehet" },
            { q: "Tegnap a bolt___ (-ba/-be) mentem.", a: "ba" },
          ],
        },
      ],
    },
  ];

  // ---------- SRS scheduler ----------
  function nextInterval(card, grade) {
    // grade: 0 (again), 3 (hard), 4 (good), 5 (easy)
    const now = Date.now();
    let { reps = 0, interval = 0, ease = 2.5 } = card || {};
    if (grade < 3) {
      return { reps: 0, interval: 5 * 60 * 1000, ease: Math.max(1.3, ease - 0.2), due: now + 5 * 60 * 1000 };
    }
    const newEase = Math.max(1.3, ease + (grade === 5 ? 0.15 : grade === 4 ? 0.05 : 0));
    let newInterval;
    if (reps === 0) newInterval = 12 * 60 * 60 * 1000;
    else if (reps === 1) newInterval = 3 * 24 * 60 * 60 * 1000;
    else newInterval = Math.round(interval * newEase);
    return { reps: reps + 1, interval: newInterval, ease: newEase, due: now + newInterval };
  }

  // ---------- TTS ----------
  let VOICES = [];
  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    VOICES = speechSynthesis.getVoices();
  }
  loadVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  function speak(text, opts={}) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const hu = VOICES.find(v => /hu/i.test(v.lang));
    if (hu) u.voice = hu, u.lang = hu.lang;
    else u.lang = "hu-HU";
    u.rate = opts.rate || 1;
    u.pitch = opts.pitch || 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  // ---------- Storage ----------
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ---------- Utils ----------
  function el(tag, attrs={}, children=[]) {
    const node = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (k === "html") node.innerHTML = v;
      else if (k === "style") node.setAttribute("style", v);
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    }
    return node;
  }
  function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); }
  function fmtDate(d=new Date()) { return d.toLocaleDateString(); }

  // ---------- Plan ----------
  function rebuildPlan() {
    const due = Object.entries(state.srs)
      .filter(([,v]) => !v?.due || v.due <= Date.now())
      .map(([id]) => ({ type: "srs", id }));
    const lvl = state.profile.level || "A1";
    const nextLesson = (CURRICULUM[lvl] || []).find(l => !state.progress.completedLessons[l.id]);
    const plan = [...due.slice(0, 10)];
    if (nextLesson) plan.push({ type: "lesson", id: nextLesson.id });
    state.todayPlan = plan;
    saveState();
  }
  rebuildPlan();

  // ---------- App Root ----------
  const root = document.getElementById("app");
  render();

  function render() {
    clear(root);
    root.appendChild(Navbar());
    if (state.ui.route === "onboarding") root.appendChild(ViewOnboarding());
    else root.appendChild(ViewDashboard());
  }

  // ---------- Navbar ----------
  function Navbar(){
    const tabs = [
      { id: "lessons", label: "Lektionen" },
      { id: "trainer", label: "Vokabeltrainer" },
      { id: "reviews", label: "Wiederholen" },
      ...(state.profile.examPrep ? [{ id: "exam", label: "Prüfung" }] : []),
      { id: "settings", label: "Einstellungen" },
    ];
    const row = el("div", { class: "nav" }, [
      el("div", { class: "title" }, [
        el("div", { class: "logo" }, ["M"]),
        el("div", { }, [el("span", { class:"mono" }, ["MagyarLab"]), " ", el("span",{class:"badge"},["A1–C2"])]),
      ]),
      el("div", { class:"tabs" }, tabs.map(t =>
        el("button", {
          class: "tab" + (state.ui.tab === t.id ? " active" : ""),
          onclick: () => { state.ui.tab = t.id; state.ui.route = "app"; saveState(); rerenderBody(); }
        }, [t.label])
      )),
    ]);
    return row;
  }

  function rerenderBody(){
    const body = document.querySelector("#app .body");
    if (!body) { render(); return; }
    const parent = body.parentElement;
    parent.removeChild(body);
    parent.appendChild(ViewRouter());
  }

  // ---------- Root content (router) ----------
  function ViewDashboard(){
    const wrap = el("div", { class:"body grid grid-2", style:"margin-top:16px" }, [
      CardDayPlan(),
      CardTips(),
      el("div", { class:"grid grid-1", style:"grid-column: 1 / -1" }, [ ViewRouter() ]),
    ]);
    return wrap;
  }

  function ViewRouter(){
    if (state.ui.tab === "lessons") return LessonList();
    if (state.ui.tab === "trainer") return Trainer();
    if (state.ui.tab === "reviews") return Reviews();
    if (state.ui.tab === "settings") return Settings();
    if (state.profile.examPrep && state.ui.tab === "exam") return ExamHome();
    return el("div"); // empty
  }

  // ---------- Onboarding (nur Niveau) ----------
  function ViewOnboarding(){
    const lvls = ["A1","A2","B1","B2","C1","C2"];
    let chosenLevel = state.profile.level || "B2";

    const card = el("div", { class:"card", style:"margin-top:16px" }, [
      el("div", { class:"hd" }, ["Willkommen! Wähle dein Niveau"]),
      el("div", { class:"bd grid grid-2" }, [
        el("div", {}, [
          el("label", {}, ["Startniveau"]),
          el("div", { class:"row", style:"margin-top:6px; flex-wrap:wrap" },
            lvls.map(l => el("button", {
              class:"btn " + (chosenLevel===l?"primary":""), onclick: () => { chosenLevel = l; }
            }, [l]))
          ),
          el("div", { class:"small" }, ["Du kannst später jederzeit wechseln."]),
        ]),
        el("div", {}, [
          el("label", {}, ["Hinweis"]),
          el("div", { class:"small" }, [
            "B2 ist aktuell mit neuen Lektionen befüllt. Andere Niveaus folgen."
          ]),
        ]),
      ]),
      el("div", { class:"ft" }, [
        el("div", { class:"small" }, ["Deutschsprachige Erklärungen, Ungarisch mit TTS."]),
        el("div", { class:"row" }, [
          el("button", { class:"btn primary", onclick: ()=>{
            state.profile.level = chosenLevel;
            state.ui.route = "app";
            state.ui.tab = "lessons";  // direkt zu den Lektionen
            saveState(); rebuildPlan(); render();
          }}, ["Loslegen"])
        ]),
      ]),
    ]);
    return card;
  }

  // ---------- Cards ----------
  function CardDayPlan(){
    const lvl = state.profile.level || "B2";
    const lessons = CURRICULUM[lvl] || [];
    const completed = Object.keys(state.progress.completedLessons).length;
    const total = lessons.length;
    const pct = total ? Math.round((completed/total)*100) : 0;
    const dueCount = Object.values(state.srs).filter(v => !v.due || v.due <= Date.now()).length;

    const bar = el("div", { class:"progress" }, [ el("i", { style:`width:${pct}%` }) ]);

    return el("div", { class:"card" }, [
      el("div", { class:"hd" }, ["Dein Lernplan ", el("span",{class:"badge"},[fmtDate()]) ]),
      el("div", { class:"bd grid grid-2" }, [
        el("div", {}, [
          el("div", {}, [bar, el("div", { class:"small", style:"margin-top:8px" }, [pct+"%"]) ]),
          el("div", { class:"hr" }),
          PlanList(),
        ]),
        el("div", {}, [ CardTipsInner(dueCount) ]),
      ]),
      el("div", { class:"ft" }, [
        el("div", { class:"row" }, [
          BtnOutline("Wiederholungen fällig: "+dueCount, ()=>{ state.ui.tab="reviews"; saveState(); rerenderBody(); }),
          BtnOutline("Lektionen öffnen", ()=>{ state.ui.tab="lessons"; saveState(); rerenderBody(); }),
          BtnOutline("Vokabeltrainer", ()=>{ state.ui.tab="trainer"; saveState(); rerenderBody(); }),
          state.profile.examPrep ? BtnOutline("Prüfungs-Demo", ()=>{ state.ui.tab="exam"; saveState(); rerenderBody(); }) : null
        ])
      ])
    ]);
  }
  function BtnOutline(label, onclick){ return el("button", { class:"btn", onclick }, [label]); }

  function PlanList(){
    const items = state.todayPlan || [];
    if (!items.length) return el("div", { class:"notice" }, ["Heute ist nichts fällig – nimm dir eine Lektion vor oder wiederhole Vokabeln."]);
    return el("div", {}, items.map(it => el("div", { class:"example" }, [
      el("div", {}, [
        el("div", { class:"hu" }, [ it.type === "srs" ? "Vokabel wiederholen" : "Lektion" ]),
        el("div", { class:"de small" }, [ it.type === "srs" ? `Karte: ${it.id}` : lessonTitle(it.id) ]),
      ]),
      el("div", { class:"row" }, [
        it.type === "srs" ? el("button", { class:"btn", onclick:()=>{ const v=vocabById(it.id); if (v) speak(v.hu); } }, ["🔊 Anhören"]) : null,
        el("button", { class:"btn primary", onclick:()=>{
          if (it.type === "srs"){ state.ui.tab="reviews"; }
          else { state.ui.tab="lessons"; state.ui.lessonId = it.id; }
          saveState(); rerenderBody();
        }}, ["Öffnen"]),
      ]),
    ])));
  }

  // ---------- Lessons ----------
  function LessonList(){
    const lvl = state.profile.level || "B2";
    const lessons = CURRICULUM[lvl] || [];
    const grid = el("div", { class:"card" }, [
      el("div", { class:"hd" }, ["Lektionen – ", lvl]),
      el("div", { class:"bd grid grid-3" }, lessons.map(l => el("div", { class:"card" }, [
        el("div", { class:"hd" }, [l.title]),
        el("div", { class:"bd" }, [
          el("div", { class:"chips" }, l.grammar.map(g => el("span", { class:"chip" }, [g.name]))),
        ]),
        el("div", { class:"ft" }, [
          el("button", { class:"btn primary block", onclick:()=>{ state.ui.lessonId = l.id; saveState(); rerenderBody(); } }, ["Öffnen"]),
        ]),
      ]))),
    ]);
    if (state.ui.lessonId) grid.appendChild(LessonView());
    return grid;
  }

  function lessonById(id){
    for (const lvl of Object.keys(CURRICULUM)){
      const hit = (CURRICULUM[lvl]||[]).find(l => l.id === id);
      if (hit) return hit;
    }
    return null;
  }
  function lessonTitle(id){ const l=lessonById(id); return l ? l.title : id; }
  function vocabById(vocabId){
    for (const lvl of Object.keys(CURRICULUM)){
      for (const l of CURRICULUM[lvl]){
        const v = (l.vocab||[]).find(x => x.id === vocabId);
        if (v) return v;
      }
    }
    return null;
  }

  function LessonView(){
    const l = lessonById(state.ui.lessonId);
    if (!l) return el("div");
    const bd = el("div", { class:"bd grid grid-2" }, [
      // links: Erklärung + Beispiele
      el("div", {}, [
        el("h3", {}, ["Grammatik (deutsch erklärt)"]),
        el("ul", {}, l.grammar.map(g => el("li", {}, [g.name]))),
        el("div", { class:"hr" }),
        el("h3", {}, ["Beispiele"]),
        ...l.examples.map(ex => el("div", { class:"example" }, [
          el("div", {}, [ el("div", { class:"hu" }, [ex.hu]), el("div", { class:"de" }, [ex.de]) ]),
          el("button", { class:"btn icon", onclick:()=>speak(ex.hu) }, ["🔊"]),
        ])),
      ]),
      // rechts: Übungen + Vokabeln
      el("div", {}, [
        el("h3", {}, ["Gyakorlás"]),
        ...renderExercises(l.exercises||[]),
        el("div", { class:"hr" }),
        el("h3", {}, ["Vokabeln"]),
        ...((l.vocab||[]).map(v => el("div", { class:"example" }, [
          el("div", {}, [ el("div", { class:"hu" }, [v.hu]), el("div", { class:"de" }, [v.de]) ]),
          el("div", { class:"row" }, [
            el("button", { class:"btn icon", onclick:()=>speak(v.hu) }, ["🔊"]),
          ])
        ]))),
        el("div", { class:"row", style:"margin-top:8px" }, [
          el("button", { class:"btn", onclick: addVocabToSRS }, ["Zur Wiederholungsliste hinzufügen"]),
        ]),
      ]),
    ]);

    const card = el("div", { class:"card", style:"margin-top:16px" }, [
      el("div", { class:"hd" }, [l.title]),
      bd,
      el("div", { class:"ft" }, [
        el("button", { class:"btn", onclick: ()=>{ state.ui.lessonId=null; saveState(); rerenderBody(); } }, ["Zurück"]),
        el("button", { class:"btn ok", onclick: markComplete }, ["Lektion als erledigt markieren"]),
      ]),
    ]);

    function markComplete(){
      state.progress.completedLessons[l.id] = true;
      saveState(); rebuildPlan(); rerenderBody();
    }
    function addVocabToSRS(){
      (l.vocab||[]).forEach(v => {
        if (!state.srs[v.id]) state.srs[v.id] = { reps:0, interval:0, ease:2.5, due: Date.now() };
      });
      saveState(); rebuildPlan(); rerenderBody();
    }

    return card;
  }

  function renderExercises(list){
    return list.map(ex => {
      if (ex.type === "gap") return GapExercise(ex);
      if (ex.type === "mc") return MCExercise(ex);
      if (ex.type === "match") return MatchExercise(ex);
      return el("div");
    });
  }
  function GapExercise(ex){
    const wrap = el("div", { class:"card exercise" }, [
      el("div", { class:"hd" }, [ex.prompt]),
      el("div", { class:"bd grid" }, ex.items.map((it,i) => GapItem(it,i))),
    ]);
    return wrap;
  }
  function GapItem(item, idx){
    let show = false;
    const ans = el("input", { class:"input", placeholder:"Antwort" });
    const sol = el("div", { class:"small", style:"display:none" }, ["Lösung: ", item.a]);
    const help = item.help ? el("div", { class:"small" }, [item.help]) : null;
    const row = el("div", { class:"item" }, [
      el("div", {}, [ item.q, help ]),
      el("div", { class:"row" }, [
        ans,
        el("button", { class:"btn", onclick:()=>{ show = !show; sol.style.display = show ? "" : "none"; } }, ["💡"]),
      ]),
      sol
    ]);
    return row;
  }
  function MCExercise(ex){
    const body = el("div", { class:"bd" }, ex.options.map((opt,i) => {
      return el("button", { class:"btn", onclick:()=>{
        [...body.children].forEach((btn, idx) => {
          btn.className = "btn" + (idx === ex.answer ? " ok" : (idx===i ? " danger" : ""));
        });
      }}, [opt]);
    }));
    return el("div", { class:"card" }, [
      el("div", { class:"hd" }, [ex.prompt]),
      body
    ]);
  }
  function MatchExercise(ex){
    return el("div", { class:"card" }, [
      el("div", { class:"hd" }, [ex.prompt]),
      el("div", { class:"bd grid" }, ex.pairs.map(p => el("div", { class:"row" }, [
        el("div", {}, [`${p.left}-`]),
        el("div", { class:"badge" }, [p.right])
      ]))),
      el("div", { class:"ft small" }, ["Hinweis: In echt als Drag-&-Drop geplant; hier als Vorschau."]),
    ]);
  }

  // ---------- Trainer / Reviews ----------
  function Trainer(){
    const queue = [];
    for (const lvl of Object.keys(CURRICULUM)){
      for (const l of CURRICULUM[lvl]){
        for (const v of (l.vocab||[])){
          const meta = state.srs[v.id];
          if (meta && (!meta.due || meta.due <= Date.now())) queue.push(v);
        }
      }
    }
    let idx = 0;
    const current = () => queue[idx];

    function grade(g){
      const cur = current(); if (!cur) return;
      const prev = state.srs[cur.id] || { reps:0, interval:0, ease:2.5 };
      state.srs[cur.id] = nextInterval(prev, g);
      saveState();
      idx += 1;
      rerenderBody();
    }

    const card = el("div", { class:"card", style:"margin-top:16px" }, [
      el("div", { class:"hd" }, ["Vokabeltrainer"]),
      el("div", { class:"bd" }, [
        !current() ? el("div", { class:"notice" }, ["Keine fälligen Karten. Füge Vokabeln aus Lektionen hinzu oder warte bis zum Fälligkeitsdatum."])
        : el("div", { class:"grid" }, [
            el("div", { class:"hu", style:"font-size:28px; text-align:center; font-weight:800" }, [ current().hu ]),
            el("div", { class:"de", style:"text-align:center" }, [ current().de ]),
            el("div", { class:"row", style:"justify-content:center" }, [
              el("button", { class:"btn", onclick:()=>speak(current().hu) }, ["🔊 Anhören"]),
            ]),
            el("div", { class:"grid grid-2" }, [
              el("button", { class:"btn danger", onclick:()=>grade(0) }, ["Nochmal"]),
              el("button", { class:"btn", onclick:()=>grade(3) }, ["Schwer"]),
              el("button", { class:"btn", onclick:()=>grade(4) }, ["Gut"]),
              el("button", { class:"btn ok", onclick:()=>grade(5) }, ["Leicht"]),
            ]),
          ])
      ])
    ]);
    return card;
  }
  function Reviews(){ return Trainer(); }

  // ---------- Settings ----------
  function Settings(){
    const lvls = ["A1","A2","B1","B2","C1","C2"];
    const card = el("div", { class:"card", style:"margin-top:16px" }, [
      el("div", { class:"hd" }, ["Einstellungen"]),
      el("div", { class:"bd grid grid-2" }, [
        el("div", {}, [
          el("label", {}, ["Niveau"]),
          el("select", { class:"select", onchange:(e)=>{ state.profile.level = e.target.value; saveState(); rebuildPlan(); } },
            lvls.map(l => el("option", { value:l, selected: state.profile.level===l ? "selected": null }, [l]))
          )
        ]),
        el("div", {}, [
          el("label", {}, ["Prüfungsvorbereitung"]),
          el("div", { class:"row" }, [
            el("input", { type:"checkbox", checked: state.profile.examPrep ? "checked" : null, onchange:(e)=>{ state.profile.examPrep = e.target.checked; saveState(); render(); } }),
            el("span", {}, ["ECL / TELC / Origó Aufgabenstil"])
          ])
        ]),
        el("div", {}, [
          el("label", {}, ["Offline-Speicherung (localStorage)"]),
          el("div", { class:"row" }, [
            el("input", { type:"checkbox", checked: state.profile.allowOffline ? "checked" : null, onchange:(e)=>{ state.profile.allowOffline = e.target.checked; saveState(); } }),
            el("span", {}, ["aktiv"])
          ])
        ]),
      ]),
      el("div", { class:"ft" }, [
        el("button", { class:"btn danger", onclick:()=>{ localStorage.removeItem(LS_KEY); location.reload(); } }, ["Alles zurücksetzen"]),
        el("span", { class:"small" }, ["Speichern erfolgt automatisch."])
      ])
    ]);
    return card;
  }

  // ---------- Exam ----------
  function ExamHome(){
    const card = el("div", { class:"card", style:"margin-top:16px" }, [
      el("div", { class:"hd" }, ["Prüfungsmodus – Sets"]),
      el("div", { class:"bd grid grid-2" }, EXAM_SETS.map(s => el("div", { class:"card" }, [
        el("div", { class:"hd" }, [s.title]),
        el("div", { class:"ft" }, [
          el("button",{ class:"btn primary block", onclick:()=>openSet(s.id) },["Öffnen"])
        ])
      ]))),
    ]);
    return card;
  }
  function openSet(id){
    const set = EXAM_SETS.find(x => x.id === id);
    if (!set) return;
    const overlay = el("div", { class:"card", style:"margin-top:16px" }, [
      el("div", { class:"hd" }, [set.title]),
      el("div", { class:"bd" }, set.parts.map((p,idx) => ExamPart(p, idx+1, set.parts.length))),
      el("div", { class:"ft" }, [
        el("button", { class:"btn", onclick:()=>{ state.ui.tab="exam"; rerenderBody(); } }, ["Schließen"]),
      ]),
    ]);
    const body = document.querySelector("#app .body");
    body.appendChild(overlay);
  }
  function ExamPart(part, i, total){
    if (part.type === "reading"){
      return el("div", { class:"card" }, [
        el("div", { class:"hd" }, [`${i}/${total} Olvasás – rövid hír`]),
        el("div", { class:"bd grid" }, [
          el("div", {}, [part.text]),
          ...part.questions.map(q => MCBlock(q)),
          el("div", { class:"small" }, ["Hinweis: ECL-Layout simuliert, ohne Zeitlimit."]),
        ])
      ]);
    }
    if (part.type === "listening"){
      return el("div", { class:"card" }, [
        el("div", { class:"hd" }, [`${i}/${total} Hallás utáni értés – hirdetés`]),
        el("div", { class:"bd grid" }, [
          el("button", { class:"btn", onclick:()=>speak(part.audioText) }, ["🔊 Anhören (TTS)"]),
          ...part.questions.map(q => MCBlock(q)),
          el("div", { class:"small" }, ["In der Vollversion ersetzen wir TTS durch Studio-Audio."]),
        ])
      ]);
    }
    if (part.type === "use"){
      return el("div", { class:"card" }, [
        el("div", { class:"hd" }, [`${i}/${total} Nyelvhasználat – hiányos szöveg`]),
        el("div", { class:"bd grid" }, part.gaps.map(g => GapInline(g))),
      ]);
    }
    return el("div");
  }
  function MCBlock(q){
    const wrap = el("div", { class:"card" }, [
      el("div", { class:"hd" }, [q.q]),
      el("div", { class:"bd grid grid-3" }, q.options.map((opt,i) =>
        el("button", {
          class:"btn",
          onclick:()=>{
            [...wrap.querySelectorAll(".bd .btn")].forEach((btn, idx) => {
              btn.className = "btn" + (idx === i ? (i===q.answer ? " ok" : " danger") : "");
            });
          }
        }, [opt])
      ))
    ]);
    return wrap;
  }
  function GapInline(g){
    let show = false; const input = el("input", { class:"input", placeholder:"Antwort" });
    const sol = el("div", { class:"small", style:"display:none" }, ["Lösung: ", g.a]);
    return el("div", { class:"row" }, [
      el("div", {}, [g.q]),
      input,
      el("button", { class:"btn", onclick:()=>{ show = !show; sol.style.display = show ? "" : "none"; } }, ["💡"]),
      sol
    ]);
  }

})(); 
