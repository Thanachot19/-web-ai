/**
 * Web Presentation Engine & Interactive AI Model Selection Suite
 * Supports: Keyboard, Touch Swipe, Fullscreen, Speaker Notes, Overview Modal,
 * Live Cost Calculator, Thai Tokenizer Demo, and Scenario Simulator.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  const progressBar = document.getElementById('presentationProgressBar');
  const currentSlideDisplay = document.getElementById('currentSlideNum');
  const totalSlidesDisplay = document.getElementById('totalSlidesNum');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const overviewBtn = document.getElementById('overviewBtn');
  const notesBtn = document.getElementById('notesBtn');
  const shortcutsBtn = document.getElementById('shortcutsBtn');
  const autoplayBtn = document.getElementById('autoplayBtn');
  const themeBtn = document.getElementById('themeBtn');

  // Theme Toggle Management (Dark / Light)
  const savedTheme = localStorage.getItem('presentation-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('presentation-theme', newTheme);
  }

  // Modals & Drawers
  const overviewModal = document.getElementById('overviewModal');
  const shortcutsModal = document.getElementById('shortcutsModal');
  const speakerNotesDrawer = document.getElementById('speakerNotesDrawer');
  const speakerNotesContent = document.getElementById('speakerNotesContent');
  const overviewGrid = document.getElementById('overviewGrid');

  // Autoplay State
  let isAutoplayActive = false;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 12000; // 12 seconds per slide

  // Set total slides count
  if (totalSlidesDisplay) {
    totalSlidesDisplay.textContent = String(totalSlides).padStart(2, '0');
  }

  // Build Overview Grid
  function buildOverviewGrid() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = '';
    slides.forEach((slide, index) => {
      const titleElem = slide.querySelector('.slide-title') || slide.querySelector('.hero-title');
      const titleText = titleElem ? titleElem.innerText.replace(/\s+/g, ' ').trim() : `สไลด์ที่ ${index + 1}`;
      
      const thumb = document.createElement('div');
      thumb.className = `overview-thumb-item ${index === currentSlideIndex ? 'current' : ''}`;
      thumb.innerHTML = `
        <span class="overview-thumb-num">สไลด์ ${String(index + 1).padStart(2, '0')}</span>
        <h5 class="overview-thumb-title">${titleText}</h5>
      `;
      thumb.addEventListener('click', () => {
        goToSlide(index);
        closeModal(overviewModal);
      });
      overviewGrid.appendChild(thumb);
    });
  }

  // Update Speaker Notes
  function updateSpeakerNotes() {
    if (!speakerNotesContent) return;
    const currentSlide = slides[currentSlideIndex];
    const notes = currentSlide.getAttribute('data-notes') || 'ไม่มีโน้ตสำหรับสไลด์นี้';
    speakerNotesContent.innerHTML = notes;
  }

  // Go to Slide function
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev');
      if (i === index) {
        slide.classList.add('active');
      } else if (i < index) {
        slide.classList.add('prev');
      }
    });

    currentSlideIndex = index;

    // Update Progress Bar
    if (progressBar) {
      const percentage = ((currentSlideIndex + 1) / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update Slide Counter
    if (currentSlideDisplay) {
      currentSlideDisplay.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }

    // Update Navigation Buttons state
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSlideIndex === totalSlides - 1;

    // Update Overview Grid highlighting
    if (overviewGrid) {
      const items = overviewGrid.querySelectorAll('.overview-thumb-item');
      items.forEach((item, idx) => {
        item.classList.toggle('current', idx === currentSlideIndex);
      });
    }

    // Update Notes
    updateSpeakerNotes();

    // Reset scroll of newly activated slide
    slides[currentSlideIndex].scrollTop = 0;
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    } else if (isAutoplayActive) {
      goToSlide(0); // Loop in autoplay
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Fullscreen Management
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (fullscreenBtn) {
      fullscreenBtn.setAttribute('title', document.fullscreenElement ? 'ออกจากเต็มหน้าจอ (F)' : 'เต็มหน้าจอ (F)');
    }
  });

  // Modal Helpers
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function toggleOverviewModal() {
    if (overviewModal.classList.contains('active')) {
      closeModal(overviewModal);
    } else {
      buildOverviewGrid();
      openModal(overviewModal);
    }
  }

  function toggleSpeakerNotes() {
    speakerNotesDrawer.classList.toggle('open');
  }

  function toggleShortcutsModal() {
    if (shortcutsModal.classList.contains('active')) {
      closeModal(shortcutsModal);
    } else {
      openModal(shortcutsModal);
    }
  }

  // Autoplay Toggle
  function toggleAutoplay() {
    isAutoplayActive = !isAutoplayActive;
    if (isAutoplayActive) {
      autoplayBtn.classList.add('active');
      autoplayBtn.style.color = 'var(--accent-cyan)';
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    } else {
      autoplayBtn.classList.remove('active');
      autoplayBtn.style.color = '';
      clearInterval(autoplayTimer);
    }
  }

  // Event Listeners for Nav Buttons
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  if (overviewBtn) overviewBtn.addEventListener('click', toggleOverviewModal);
  if (notesBtn) notesBtn.addEventListener('click', toggleSpeakerNotes);
  if (shortcutsBtn) shortcutsBtn.addEventListener('click', toggleShortcutsModal);
  if (autoplayBtn) autoplayBtn.addEventListener('click', toggleAutoplay);
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Close modals on clicking backdrop or close buttons
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal-overlay'));
    });
  });

  // Close speaker notes button inside drawer
  const closeNotesBtn = document.getElementById('closeNotesBtn');
  if (closeNotesBtn) {
    closeNotesBtn.addEventListener('click', () => {
      speakerNotesDrawer.classList.remove('open');
    });
  }

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    // If user is typing in an input, don't trigger slide shortcuts
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case ' ':
        e.preventDefault();
        if (e.shiftKey) {
          prevSlide();
        } else {
          nextSlide();
        }
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'o':
      case 'O':
        toggleOverviewModal();
        break;
      case 'n':
      case 'N':
        toggleSpeakerNotes();
        break;
      case '?':
        toggleShortcutsModal();
        break;
      case 'p':
      case 'P':
        toggleAutoplay();
        break;
      case 't':
      case 'T':
        toggleTheme();
        break;
      case 'Escape':
        closeModal(overviewModal);
        closeModal(shortcutsModal);
        speakerNotesDrawer.classList.remove('open');
        break;
    }
  });

  // Touch Gesture Navigation (Swipe Left / Right)
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Check if horizontal swipe dominates vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0) {
        nextSlide(); // Swiped left -> next
      } else {
        prevSlide(); // Swiped right -> prev
      }
    }
  }, { passive: true });

  // Quick challenge jump from any element with [data-target-slide] (Title chips & Slide 3 cards)
  document.querySelectorAll('[data-target-slide]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIndex = parseInt(elem.getAttribute('data-target-slide'), 10);
      if (!isNaN(targetIndex)) {
        goToSlide(targetIndex);
      }
    });
  });

  // =========================================================================
  // Interactive Feature 1: Thai Tokenizer Demo (Slide 9)
  // =========================================================================
  const sampleEnTokens = ["Hello", "world", ",", "artificial", "intelligence", "is", "transforming", "modern", "business", "workflow", "."];
  const sampleThTokens = ["ส", "วัส", "ดี", "ครับ", "ปัญญา", "ประ", "ดิษฐ์", "กำลัง", "เปลี่ยน", "แปลง", "กระ", "บวน", "การ", "ทำงาน", "ของ", "ธุรกิจ", "ยุค", "ใหม่"];

  const enTokenContainer = document.getElementById('enTokenContainer');
  const thTokenContainer = document.getElementById('thTokenContainer');
  const enCountDisplay = document.getElementById('enCountDisplay');
  const thCountDisplay = document.getElementById('thCountDisplay');
  const tokenRatioDisplay = document.getElementById('tokenRatioDisplay');

  function renderTokenizerDemo() {
    if (!enTokenContainer || !thTokenContainer) return;
    
    enTokenContainer.innerHTML = '';
    sampleEnTokens.forEach(token => {
      const chip = document.createElement('span');
      chip.className = 't-chip t-en';
      chip.textContent = token;
      enTokenContainer.appendChild(chip);
    });
    if (enCountDisplay) enCountDisplay.textContent = `${sampleEnTokens.length} tokens`;

    thTokenContainer.innerHTML = '';
    sampleThTokens.forEach(token => {
      const chip = document.createElement('span');
      chip.className = 't-chip t-th';
      chip.textContent = token;
      thTokenContainer.appendChild(chip);
    });
    if (thCountDisplay) thCountDisplay.textContent = `${sampleThTokens.length} tokens`;

    if (tokenRatioDisplay) {
      const ratio = (sampleThTokens.length / sampleEnTokens.length).toFixed(1);
      tokenRatioDisplay.textContent = `${ratio}x (กิน Token มากกว่าเกือบ ${ratio} เท่า!)`;
    }
  }
  renderTokenizerDemo();

  // =========================================================================
  // Interactive Feature 2: Scenario Decision Simulator & Calculator (Slide 16)
  // =========================================================================
  const simScenarios = {
    email: {
      name: "สรุปอีเมล 2,000 ฉบับ",
      inputTokens: 1000000, // 1M tokens
      outputTokens: 50000,  // 50K tokens
      recommendedTier: "รุ่นเล็ก (Fast / Nano)",
      recommendedModel: "Gemini 3.1 Flash / GPT-6 Luna",
      reason: "ข้อมูลปริมาณมหาศาล งานสรุปไม่ซับซ้อน ต้องการความเร็วสูงและคุมค่าใช้จ่าย การใช้ Flash ประหยัดกว่าเรือธงถึง 66 เท่า!",
      securityNote: "สามารถเปิดใช้ Batch API เพื่อรับส่วนลดราคาต่อ token เพิ่มอีก 50%"
    },
    code: {
      name: "วิเคราะห์โค้ด 500 บรรทัด",
      inputTokens: 30000,
      outputTokens: 5000,
      recommendedTier: "เรือธง (Flagship) / Reasoning",
      recommendedModel: "Claude Sonnet 5.5 / DeepSeek R-series",
      reason: "งานเขียนโค้ดและดีบักต้องการความแม่นยำสูงสุด ลอจิกซับซ้อน พลาดไม่ได้ ต้องใช้โมเดลตรรกะสูงหรือมี Chain of Thought",
      securityNote: "อ้างอิงคะแนน SWE-bench และ HumanEval สูงสุดเพื่อลด Bug ในการทำงาน"
    },
    thaiChat: {
      name: "ตอบแชทลูกค้าภาษาไทย",
      inputTokens: 500000,
      outputTokens: 150000,
      recommendedTier: "โมเดลไทยเฉพาะทาง / Fast Model",
      recommendedModel: "Typhoon (SCB 10X) / Gemini Flash",
      reason: "ต้องการ Time to First Token (TTFT) ต่ำ ลูกค้าไม่ต้องรอนาน เข้าใจภาษาพูด แสลง และวัฒนธรรมการซื้อขายของไทย",
      securityNote: "คำนวณต้นทุนเผื่อ Tokenizer ภาษาไทยที่กิน Token มากกว่าภาษาอังกฤษ 2-4 เท่า"
    },
    secret: {
      name: "ข้อมูลลูกค้าลับ & PDPA",
      inputTokens: 200000,
      outputTokens: 20000,
      recommendedTier: "โมเดลเปิด (Open Weights - On Premise)",
      recommendedModel: "Llama 3.3 / DeepSeek / Qwen (รันบนเซิร์ฟเวอร์ในองค์กร)",
      reason: "ข้อมูลสำคัญห้ามส่งออกภายนอกผ่าน Public API รันบนเครื่องตนเอง 100% ป้องกันข้อมูลรั่วไหล สอดคล้องตามกฎหมาย PDPA",
      securityNote: "ไม่มีค่าบริการต่อ Token (Zero Token Cost) แต่ต้องลงทุนระบบฮาร์ดแวร์ GPU"
    }
  };

  // Pricing Matrix (per 1M tokens) from Slide 8
  const modelPricing = [
    { name: "GPT-6 Astra (เรือธง)", inputRate: 10.0, outputRate: 50.0, tier: "flagship" },
    { name: "GPT-6.1 Sol (สมดุล)", inputRate: 2.0, outputRate: 10.0, tier: "balanced" },
    { name: "Gemini 3.1 Pro (Multimodal)", inputRate: 7.0, outputRate: 21.0, tier: "flagship" },
    { name: "Claude Sonnet 5.5 (สมดุล/โค้ด)", inputRate: 2.0, outputRate: 10.0, tier: "balanced" },
    { name: "Gemini 3.1 Flash (เร็ว/ประหยัด)", inputRate: 0.15, outputRate: 0.60, tier: "fast" },
    { name: "GPT-6 Luna (เร็ว/ถูก)", inputRate: 0.20, outputRate: 1.20, tier: "fast" }
  ];

  const USD_TO_THB = 36.5;

  const simInputRange = document.getElementById('simInputTokensRange');
  const simOutputRange = document.getElementById('simOutputTokensRange');
  const simInputDisplay = document.getElementById('simInputDisplay');
  const simOutputDisplay = document.getElementById('simOutputDisplay');

  const simRecTitle = document.getElementById('simRecTitle');
  const simRecTier = document.getElementById('simRecTier');
  const simRecReason = document.getElementById('simRecReason');
  const simRecSecurity = document.getElementById('simRecSecurity');
  const simCostTableBody = document.getElementById('simCostTableBody');

  function updateSimulatorCalculation(inputTokens, outputTokens) {
    if (simInputDisplay) simInputDisplay.textContent = `${Number(inputTokens).toLocaleString()} Tokens`;
    if (simOutputDisplay) simOutputDisplay.textContent = `${Number(outputTokens).toLocaleString()} Tokens`;

    if (!simCostTableBody) return;
    simCostTableBody.innerHTML = '';

    modelPricing.forEach(model => {
      const costUSD = ((inputTokens / 1000000) * model.inputRate) + ((outputTokens / 1000000) * model.outputRate);
      const costTHB = costUSD * USD_TO_THB;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: #cbd5e1; font-weight: 600;">${model.name}</td>
        <td class="val-col" style="color: ${model.tier === 'fast' ? 'var(--accent-emerald)' : model.tier === 'flagship' ? 'var(--accent-rose)' : 'var(--accent-blue)'}">
          $${costUSD < 0.01 ? costUSD.toFixed(4) : costUSD.toFixed(2)}
          <span style="font-size: 0.75rem; color: var(--text-dim); display: block;">≈ ฿${costTHB < 1 ? costTHB.toFixed(2) : Math.round(costTHB).toLocaleString()}</span>
        </td>
      `;
      simCostTableBody.appendChild(tr);
    });
  }

  function applyScenario(scenarioKey) {
    const data = simScenarios[scenarioKey];
    if (!data) return;

    if (simInputRange) simInputRange.value = data.inputTokens;
    if (simOutputRange) simOutputRange.value = data.outputTokens;

    if (simRecTitle) simRecTitle.textContent = data.recommendedModel;
    if (simRecTier) simRecTier.textContent = `ระดับที่แนะนำ: ${data.recommendedTier}`;
    if (simRecReason) simRecReason.textContent = data.reason;
    if (simRecSecurity) simRecSecurity.textContent = `💡 ข้อควรจำ: ${data.securityNote}`;

    // Highlight active button
    document.querySelectorAll('.sim-scenario-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-scenario') === scenarioKey);
    });

    updateSimulatorCalculation(data.inputTokens, data.outputTokens);
  }

  // Bind scenario buttons
  document.querySelectorAll('.sim-scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-scenario');
      applyScenario(key);
    });
  });

  // Bind range sliders
  if (simInputRange && simOutputRange) {
    const handleSliderChange = () => {
      document.querySelectorAll('.sim-scenario-btn').forEach(btn => btn.classList.remove('active'));
      if (simRecTier) simRecTier.textContent = 'ระดับที่แนะนำ: โหมดคำนวณตามความต้องการ (Custom)';
      if (simRecTitle) simRecTitle.textContent = 'เปรียบเทียบทุกระดับ';
      if (simRecReason) simRecReason.textContent = 'พิจารณาสมดุลระหว่างระดับความฉลาดที่งานต้องการและต้นทุนรวมต่อเดือน';
      if (simRecSecurity) simRecSecurity.textContent = '💡 อย่าลืม: งานปริมาณมากให้คำนึงถึงรุ่นเล็กก่อนเสมอตามกฎประหยัด 60-80%';
      updateSimulatorCalculation(parseInt(simInputRange.value, 10), parseInt(simOutputRange.value, 10));
    };

    simInputRange.addEventListener('input', handleSliderChange);
    simOutputRange.addEventListener('input', handleSliderChange);
  }

  // Initialize Simulator with scenario 1
  applyScenario('email');

  // Initialize first slide
  goToSlide(0);
});
