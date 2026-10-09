document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  //  ✏️ ส่วนที่ต้องแก้เอง (ตั้งค่าตรงนี้ที่เดียว)
  // =====================================================

  // วันที่เริ่มคบกัน (ปี-เดือน-วัน เวลา) แก้ให้ตรงของจริง
  const START_DATE = new Date("2026-09-10T00:00:00");

  // ข้อความจดหมาย ขึ้นบรรทัดใหม่ด้วย \n (เว้นบรรทัด = \n\n)
  const LETTER_TEXT =
    "ครบ 1 เดือนแล้วนะ จริงๆก็รู้จักกันมา3ปีกว่าแล้วแหละ555\n\n" +
    "ขอบคุณที่เข้ามานะ มีความสุขมากๆเลยที่ได้อยู่ด้วยกัน\n\n" +
    "ขอบคุณที่ยังรักกันมาโดยตลอดและตลอดไปนะ\n\n" +
    "ต่อจากนี้ไม่ว่าจะอีกกี่เดือน อยากให้ยังเป็นเธออยู่ข้างๆ แบบนี้ตลอดไปนะ";

  // คำลงท้ายจดหมาย
  const LETTER_SIGN = "รักเธอมากๆ นะ";

  // คำใต้รูปตอนกดดูใหญ่ เรียงตามลำดับรูป 1-19 แล้วรูปกลางเป็นรูปสุดท้าย
  // ไม่อยากใส่ก็ปล่อยเป็น "" ได้
  const CAPTIONS = [
    "", "", "", "", "",
    "", "", "", "", "",
    "", "", "", "", "",
    "", "", "", "",
    "Our Best Memory"
  ];

  const TYPE_SPEED = 120; // ความเร็วพิมพ์จดหมาย (มิลลิวินาที/ตัวอักษร) ยิ่งน้อยยิ่งเร็ว

  // วินาทีของเพลงที่อยากให้เริ่มตอนกด (0 = เริ่มต้นเพลง, 45 = เริ่มที่ 0:45)
  const MUSIC_START = 0;
  // เฟดเสียงเข้า (มิลลิวินาที) ใส่ 0 ถ้าอยากให้ดังทันที
  const MUSIC_FADE = 1200;

  // ช่วงห่างระหว่างรูปแต่ละใบตอนเด้งขึ้นมา (มิลลิวินาที) ยิ่งเยอะยิ่งช้า
  // 250 = เร็วขึ้น, 350 = ใบละ 0.35 วิ, 500 = ช้าลง
  const POP_GAP = 350;

  // ข้อความซึ้งๆ ในหน้ากุหลาบ (ขึ้นบรรทัดใหม่ด้วย \n)
  const FLOWER_MESSAGE =
    "ถึงภาษารักเป๊ะจะแสดงออกมาไม่เก่ง แต่เป๊ะตั้งใจทำทุกอย่างเพื่อเธอนะ พี่ใบตุ่น\nกุหลาบดอกนี้ให้เธอคนเดียวนะ";
  const FLOWER_HINT = "แตะที่กุหลาบ";

  // =====================================================

  const stage = document.getElementById("stage");
  const mainPhotoBtn = document.getElementById("mainPhotoBtn");
  const scatterGallery = document.getElementById("scatterGallery");
  const items = scatterGallery.querySelectorAll(".scatter-item");
  const bg = document.getElementById("cyberBg");
  const burstLayer = document.getElementById("burstLayer");
  const letterBtn = document.getElementById("letterBtn");

  // เครื่อง CPU 4 แกนหรือน้อยกว่า = ลดจำนวนของที่เคลื่อนไหวอัตโนมัติ
  const LOW_POWER = (navigator.hardwareConcurrency || 8) <= 4;
  if (LOW_POWER) document.body.classList.add("low-power");

  // ตอนกุหลาบแตก: FLOWER_COUNT = จำนวนกลีบ, LEAF_COUNT = จำนวนหัวใจ
  const FLOWER_COUNT = LOW_POWER ? 45 : 70;
  const LEAF_COUNT = LOW_POWER ? 32 : 50;

  // ---------- ย่อ/ขยายเวทีให้พอดีจอ ทำให้ iPad เห็นเหมือนบนคอม ----------
  const STAGE_W = 1600;
  const STAGE_H = 900;

  function fitStage() {
    const vv = window.visualViewport;
    const w = vv ? vv.width : window.innerWidth;
    const h = vv ? vv.height : window.innerHeight;
    const scale = Math.min(w / STAGE_W, h / STAGE_H);
    stage.style.setProperty("--s", scale);
  }

  fitStage();
  window.addEventListener("resize", fitStage);
  window.addEventListener("orientationchange", () => setTimeout(fitStage, 200));
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fitStage);
  }

  // ---------- ปรับกรอบให้พอดีกับสัดส่วนรูปจริง (รูปไม่โดนตัด) ----------
  items.forEach((el) => {
    const img = el.querySelector("img");
    if (!img) return; // ข้ามช่องข้อความ

    const isCenter = el.classList.contains("pic-center");
    const padX = isCenter ? 18 : 14;
    const padY = isCenter ? 50 : 14;

    const w0 = el.offsetWidth;
    const h0 = el.offsetHeight;
    const cx = el.offsetLeft + w0 / 2;
    const cy = el.offsetTop + h0 / 2;
    const imgArea = (w0 - padX) * (h0 - padY);

    function fitFrame() {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const ratio = img.naturalWidth / img.naturalHeight;

      const ih = Math.sqrt(imgArea / ratio);
      const iw = ih * ratio;

      const newW = iw + padX;
      const newH = ih + padY;

      el.style.width = newW.toFixed(1) + "px";
      el.style.height = newH.toFixed(1) + "px";
      // ปิดการขยับตำแหน่ง left/top เพื่ออิงพิกัดจาก CSS
      // el.style.left = (cx - newW / 2).toFixed(1) + "px";
      // el.style.top = (cy - newH / 2).toFixed(1) + "px";
    }

    if (img.complete && img.naturalWidth) {
      fitFrame();
    } else {
      img.addEventListener("load", fitFrame, { once: true });
    }
  });

  // ---------- หัวใจ SVG (ทึบ หรือ แบบเส้นขอบ) ----------
  const HEART_PATH =
    "M12 21s-7.5-4.6-9.6-9.2C.8 8.2 3 4.5 6.6 4.5c2 0 3.7 1.1 5.4 3.1 1.7-2 3.4-3.1 5.4-3.1 3.6 0 5.8 3.7 4.2 7.3C19.5 16.4 12 21 12 21z";

  function heartSVG(color, outline) {
    if (outline) {
      return (
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="' + HEART_PATH + '" fill="none" stroke="' + color +
        '" stroke-width="1.4" stroke-linejoin="round"/></svg>'
      );
    }
    return (
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="' + HEART_PATH + '" fill="' + color + '"/></svg>'
    );
  }

  const palette = ["#f6e9e0", "#f9c4cc", "#f08aa0", "#e0405a", "#b32a45"];
  const rand = (min, max) => min + Math.random() * (max - min);

  // ---------- หัวใจลอยด้านหลัง ----------
  const HEART_COUNT = LOW_POWER ? 18 : 28;

  for (let i = 0; i < HEART_COUNT; i++) {
    const size = rand(14, 64);
    const depth = (size - 14) / 50; // 0 = ไกล, 1 = ใกล้
    const riseTime = 22 - depth * 10 + rand(-1.5, 1.5);

    const el = document.createElement("div");
    el.className = "float-heart";
    el.style.left = rand(1, 96) + "%";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.setProperty("--o", (0.28 + depth * 0.3).toFixed(2));
    el.style.animationDuration = riseTime.toFixed(1) + "s";
    el.style.animationDelay = "-" + rand(0, riseTime).toFixed(1) + "s";
    if (depth > 0.7) el.style.filter = "blur(1.5px)";

    const color = palette[Math.floor(Math.random() * palette.length)];
    el.innerHTML = heartSVG(color, Math.random() < 0.4);

    const svg = el.firstChild;
    svg.style.animationDuration = rand(3, 6).toFixed(1) + "s";
    svg.style.animationDelay = "-" + rand(0, 4).toFixed(1) + "s";

    bg.appendChild(el);
  }

  // ---------- หัวใจพุ่งกระจาย ณ ตำแหน่งที่ระบุ ----------
  function burstAt(x, y, count) {
    if (burstLayer.childElementCount > 90) return; // กันแตะรัวจนหนักเครื่อง
    count = count || 8;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "burst-heart";
      el.style.left = x + "px";
      el.style.top = y + "px";
      const s = rand(0.7, 1.4);
      el.innerHTML = heartSVG(
        palette[Math.floor(Math.random() * 4)],
        Math.random() < 0.3
      );
      burstLayer.appendChild(el);

      const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
      const dist = rand(50, 120);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 30;
      const rot = rand(-50, 50);

      const anim = el.animate(
        [
          { transform: "translate(0,0) scale(0.2) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ") rotate(" + rot + "deg)", opacity: 1, offset: 0.55 },
          { transform: "translate(" + dx * 1.15 + "px," + (dy - 40) + "px) scale(" + s * 0.8 + ") rotate(" + rot * 1.3 + "deg)", opacity: 0 }
        ],
        { duration: rand(900, 1400), easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
      anim.onfinish = () => el.remove();
    }
  }

  // แตะตรงไหนก็ได้ หัวใจพุ่งกระจาย
  document.addEventListener("pointerdown", (e) => {
    burstAt(e.clientX, e.clientY, 8);
  });

  // ---------- เพลงพื้นหลัง ----------
  const bgm = document.getElementById("bgm");
  const musicBtn = document.getElementById("musicBtn");

  function syncMusicBtn() {
    const on = !bgm.paused;
    musicBtn.classList.toggle("playing", on);
    musicBtn.classList.toggle("off", !on);
  }

  // โผล่ปุ่มเฉพาะเมื่อมีไฟล์เพลงจริง
  bgm.addEventListener("loadeddata", () => {
    musicBtn.hidden = false;
    syncMusicBtn();
  });
  bgm.addEventListener("error", () => {
    musicBtn.hidden = true;
  });
  bgm.addEventListener("play", syncMusicBtn);
  bgm.addEventListener("pause", syncMusicBtn);

  musicBtn.addEventListener("click", () => {
    if (bgm.paused) {
      bgm.play().catch(() => {});
    } else {
      bgm.pause();
    }
  });

  // ---------- กดเปิดแกลเลอรี ----------
  items.forEach((el, i) => {
    el.style.transitionDelay = i * POP_GAP + "ms";
  });

  mainPhotoBtn.addEventListener("click", () => {
    mainPhotoBtn.classList.add("hide-out");

    // เริ่มเพลงที่ท่อนที่เลือก (ต้องเริ่มจากการกดของผู้ใช้ เบราว์เซอร์ถึงยอม)
    try {
      bgm.currentTime = Math.max(0, MUSIC_START - 0.3);
    } catch (err) {}

    bgm.volume = MUSIC_FADE > 0 ? 0 : 0.6;
    bgm.play().catch(() => {});

    if (MUSIC_FADE > 0) {
      const fadeStart = performance.now();
      const fade = setInterval(() => {
        const t = Math.min(1, (performance.now() - fadeStart) / MUSIC_FADE);
        bgm.volume = 0.6 * t;
        if (t >= 1) clearInterval(fade);
      }, 50);
    }

    setTimeout(() => {
      scatterGallery.classList.add("active");
    }, 300);

    // ฝนหัวใจตอนรูปกระจาย (ยืดไปตามจำนวนรูปและความช้าของการเด้ง)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bursts = Math.round((items.length * POP_GAP) / 600);
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => {
        burstAt(rand(vw * 0.15, vw * 0.85), rand(vh * 0.2, vh * 0.8), 10);
      }, 350 + i * 600);
    }

    // รอให้รูปขึ้นครบทุกใบก่อน ค่อยเคลียร์ดีเลย์และโชว์ปุ่มจดหมาย
    const allShownAt = 300 + items.length * POP_GAP + 1300;

    setTimeout(() => {
      items.forEach((el) => {
        el.style.transitionDelay = "0ms";
      });
    }, allShownAt);

    // ปุ่มจดหมายค่อยๆ โผล่
    setTimeout(() => {
      letterBtn.classList.add("show");
    }, allShownAt + 200);
  });

  // ---------- หน้าต่างซ้อน: ปิดด้วยปุ่ม X / กดพื้นหลัง / Esc ----------
  const letterOverlay = document.getElementById("letterOverlay");
  const lightbox = document.getElementById("lightbox");

  function openOverlay(ov) {
    ov.classList.add("open");
  }

  function closeOverlay(ov) {
    ov.classList.remove("open");
    if (ov === letterOverlay) stopLetter();
  }

  document.querySelectorAll(".overlay").forEach((ov) => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov || e.target.closest("[data-close]")) {
        closeOverlay(ov);
      }
    });
  });

  // ---------- จดหมาย + ตัวนับเวลา ----------
  const letterTyped = document.getElementById("letterTyped");
  const letterRest = document.getElementById("letterRest");
  const letterSign = document.getElementById("letterSign");
  const dayCounter = document.getElementById("dayCounter");
  let typeTimer = null;
  let counterTimer = null;

  const pad2 = (n) => String(n).padStart(2, "0");

  function updateCounter() {
    const diff = Math.max(0, Date.now() - START_DATE.getTime());
    const total = Math.floor(diff / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    const cell = (num, label) =>
      '<div class="cell"><span class="num">' + num +
      '</span><span class="lab">' + label + "</span></div>";

    dayCounter.innerHTML =
      cell(d, "Days") + cell(pad2(h), "Hours") +
      cell(pad2(m), "Min") + cell(pad2(s), "Sec");
  }

  function startLetter() {
    stopLetter();

    updateCounter();
    counterTimer = setInterval(updateCounter, 1000);

    letterSign.textContent = LETTER_SIGN;
    letterSign.classList.remove("show");
    letterTyped.textContent = "";
    letterRest.textContent = LETTER_TEXT;

    let n = 0;
    // รอให้การ์ดเลื่อนขึ้นมาก่อนแล้วค่อยเริ่มพิมพ์
    typeTimer = setTimeout(function tick() {
      n += 1;
      letterTyped.textContent = LETTER_TEXT.slice(0, n);
      letterRest.textContent = LETTER_TEXT.slice(n);
      if (n >= LETTER_TEXT.length) {
        typeTimer = null;
        letterSign.classList.add("show");
        return;
      }
      typeTimer = setTimeout(tick, TYPE_SPEED);
    }, 700);
  }

  function stopLetter() {
    clearTimeout(typeTimer);
    clearInterval(counterTimer);
    typeTimer = null;
    counterTimer = null;
  }

  // แตะที่การ์ดระหว่างพิมพ์ = ข้ามไปแสดงข้อความทั้งหมดเลย
  letterOverlay.querySelector(".letter-card").addEventListener("click", () => {
    if (typeTimer) {
      clearTimeout(typeTimer);
      typeTimer = null;
      letterTyped.textContent = LETTER_TEXT;
      letterRest.textContent = "";
      letterSign.classList.add("show");
    }
  });

  letterBtn.addEventListener("click", () => {
    openOverlay(letterOverlay);
    startLetter();
  });

  // ---------- ดูรูปขนาดใหญ่ ----------
  const photoItems = Array.from(items).filter((el) => el.querySelector("img"));
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  const lbCount = document.getElementById("lbCount");
  let lbIndex = 0;

  function showPhoto(i) {
    const n = photoItems.length;
    lbIndex = (i + n) % n;
    const src = photoItems[lbIndex].querySelector("img");
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt;
    lbCap.textContent = CAPTIONS[lbIndex] || "";
    lbCount.textContent = pad2(lbIndex + 1) + " / " + pad2(n);
  }

  photoItems.forEach((el, i) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      showPhoto(i);
      openOverlay(lightbox);
    });
  });

  document.getElementById("lbPrev").addEventListener("click", () => showPhoto(lbIndex - 1));
  document.getElementById("lbNext").addEventListener("click", () => showPhoto(lbIndex + 1));

  // คีย์บอร์ด: Esc ปิด, ลูกศรซ้ายขวาเลื่อนรูป
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay.open").forEach(closeOverlay);
    }
    if (lightbox.classList.contains("open")) {
      if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
      if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
    }
  });

  // ปัดนิ้วซ้าย-ขวาบน iPad เพื่อเลื่อนรูป
  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  // =====================================================
  //  🌹 กุหลาบหลังปิดจดหมาย → กดแล้วกลีบกุหลาบกับหัวใจกระจายเต็มเว็บ
  // =====================================================
  (function () {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const PETAL_COLORS = ["#9e1f3a", "#b32a45", "#c92f4e", "#e0405a", "#f08aa0"];
    const HEART_COLORS = ["#f6e9e0", "#f9c4cc", "#f08aa0", "#e0405a", "#b32a45"];

    // ดอกกุหลาบ (มองจากด้านบน ซ้อนกลีบเป็นชั้นๆ)
    function roseSVG() {
      const edge = 'stroke="rgba(36,9,16,0.35)" stroke-width="1.2"';
      let s = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';
      for (let i = 0; i < 6; i++) {
        s += '<ellipse cx="50" cy="22" rx="17" ry="21" fill="#9e1f3a" ' + edge +
          ' transform="rotate(' + 60 * i + ' 50 50)"/>';
      }
      for (let i = 0; i < 5; i++) {
        s += '<ellipse cx="50" cy="31" rx="13" ry="17" fill="#c92f4e" ' + edge +
          ' transform="rotate(' + (72 * i + 20) + ' 50 50)"/>';
      }
      for (let i = 0; i < 4; i++) {
        s += '<ellipse cx="50" cy="39" rx="10" ry="13" fill="#e0405a" ' + edge +
          ' transform="rotate(' + (90 * i + 10) + ' 50 50)"/>';
      }
      s += '<circle cx="50" cy="50" r="12" fill="#f08aa0" ' + edge + '/>';
      s += '<path d="M50 50 a2.5 2.5 0 1 1 2.5 2.5 a5 5 0 1 1 -5 -5 a7.5 7.5 0 1 1 7.5 7.5" ' +
        'fill="none" stroke="rgba(36,9,16,0.45)" stroke-width="1.4" stroke-linecap="round"/>';
      return s + "</svg>";
    }

    // กลีบกุหลาบ 1 กลีบ
    function petalSVG(color) {
      return (
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 2.5C17.5 5 21 11.5 12 21.5C3 11.5 6.5 5 12 2.5z" fill="' + color + '"/>' +
        '<path d="M12 5.5C14 9 14 13 12 17.5" stroke="rgba(246,233,224,0.35)" ' +
        'stroke-width="1" fill="none" stroke-linecap="round"/></svg>'
      );
    }

    // ---------- กลีบกุหลาบ + หัวใจกระจายเต็มเว็บ (อยู่ถาวร) ----------
    let layer = null;
    function getLayer() {
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "bloom-layer";
        document.body.appendChild(layer);
      }
      return layer;
    }

    function bloom(cx, cy) {
      const lay = getLayer();
      const W = window.innerWidth;
      const H = window.innerHeight;

      for (let i = 0; i < FLOWER_COUNT + LEAF_COUNT; i++) {
        const isPetal = i < FLOWER_COUNT;
        const size = isPetal ? rand(26, 58) : rand(16, 38);
        const x = rand(0, 100);
        const y = rand(0, 100);
        const rot = rand(-180, 180);
        const op = rand(0.75, 1);

        const el = document.createElement("div");
        el.className = "bloom-item" + (isPetal ? " is-flower" : "");
        el.style.left = x + "%";
        el.style.top = y + "%";
        el.style.width = size + "px";
        el.style.height = size + "px";
        el.style.margin = -size / 2 + "px 0 0 " + -size / 2 + "px";
        el.style.opacity = op.toFixed(2);
        el.style.transform = "rotate(" + rot.toFixed(1) + "deg)";

        if (isPetal) {
          el.innerHTML = petalSVG(pick(PETAL_COLORS));
          const svg = el.firstChild;
          svg.style.animationDuration = rand(3.5, 6.5).toFixed(1) + "s";
          svg.style.animationDelay = "-" + rand(0, 4).toFixed(1) + "s";
        } else {
          el.innerHTML = heartSVG(pick(HEART_COLORS), Math.random() < 0.3);
        }

        lay.appendChild(el);

        const dx = cx - (W * x) / 100;
        const dy = cy - (H * y) / 100;

        el.animate(
          [
            { transform: "translate(" + dx + "px," + dy + "px) scale(0.1) rotate(0deg)", opacity: 0 },
            { transform: "translate(" + dx * 0.35 + "px," + dy * 0.35 + "px) scale(1.15) rotate(" + rot * 0.6 + "deg)", opacity: 1, offset: 0.45 },
            { transform: "translate(0,0) scale(1) rotate(" + rot + "deg)", opacity: op }
          ],
          {
            duration: rand(1400, 2400),
            delay: rand(0, 450),
            easing: "cubic-bezier(0.2, 0.8, 0.25, 1)",
            fill: "backwards"
          }
        );
      }
    }

    // ---------- กุหลาบเด้งขึ้นมาพร้อมข้อความ ----------
    function showFlower() {
      const pop = document.createElement("div");
      pop.className = "flower-pop";
      pop.innerHTML =
        '<div class="fp-flower" role="button" aria-label="กุหลาบ">' +
        roseSVG() +
        '</div><div class="fp-card"><p class="fp-msg"></p><p class="fp-hint"></p></div>';
      pop.querySelector(".fp-msg").textContent = FLOWER_MESSAGE;
      pop.querySelector(".fp-hint").textContent = FLOWER_HINT;
      document.body.appendChild(pop);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => pop.classList.add("show"))
      );

      const flower = pop.querySelector(".fp-flower");
      let done = false;
      flower.addEventListener("click", () => {
        if (done) return;
        done = true;
        const rect = flower.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        pop.classList.add("go");
        bloom(cx, cy);
        setTimeout(() => pop.remove(), 900);
      });
    }

    // ---------- จับจังหวะตอนปิดจดหมาย (ครั้งแรกครั้งเดียว) ----------
    let wasOpen = false;
    let shown = false;
    new MutationObserver(() => {
      const open = letterOverlay.classList.contains("open");
      if (open) {
        wasOpen = true;
      } else if (wasOpen && !shown) {
        shown = true;
        setTimeout(showFlower, 650);
      }
    }).observe(letterOverlay, { attributes: true, attributeFilter: ["class"] });
  })();
});