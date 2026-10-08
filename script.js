document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  //  ✏️ ส่วนที่ต้องแก้เอง (ตั้งค่าตรงนี้ที่เดียว)
  // =====================================================

  // วันที่เริ่มคบกัน (ปี-เดือน-วัน เวลา) แก้ให้ตรงของจริง
  const START_DATE = new Date("2026-09-10T00:00:00");

  // ข้อความจดหมาย ขึ้นบรรทัดใหม่ด้วย \n (เว้นบรรทัด = \n\n)
  const LETTER_TEXT =
    "ครบ 1 เดือนแล้วนะ\n\n" +
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

  const TYPE_SPEED = 55; // ความเร็วพิมพ์จดหมาย (มิลลิวินาที/ตัวอักษร) ยิ่งน้อยยิ่งเร็ว

  // =====================================================

  const stage = document.getElementById("stage");
  const mainPhotoBtn = document.getElementById("mainPhotoBtn");
  const scatterGallery = document.getElementById("scatterGallery");
  const items = scatterGallery.querySelectorAll(".scatter-item");
  const bg = document.getElementById("cyberBg");
  const burstLayer = document.getElementById("burstLayer");
  const letterBtn = document.getElementById("letterBtn");

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
      el.style.left = (cx - newW / 2).toFixed(1) + "px";
      el.style.top = (cy - newH / 2).toFixed(1) + "px";
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
  const HEART_COUNT = 28;

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
    el.style.transitionDelay = i * 45 + "ms";
  });

  mainPhotoBtn.addEventListener("click", () => {
    mainPhotoBtn.classList.add("hide-out");

    // เริ่มเพลง (ต้องเริ่มจากการกดของผู้ใช้ เบราว์เซอร์ถึงยอม)
    bgm.volume = 0.6;
    bgm.play().catch(() => {});

    setTimeout(() => {
      scatterGallery.classList.add("active");
    }, 300);

    // ฝนหัวใจตอนรูปกระจาย
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        burstAt(rand(vw * 0.15, vw * 0.85), rand(vh * 0.2, vh * 0.8), 10);
      }, 350 + i * 220);
    }

    // เคลียร์ดีเลย์หลังรูปขึ้นครบ เพื่อให้ตอนแตะ/เอาเมาส์ชี้ตอบสนองทันที
    setTimeout(() => {
      items.forEach((el) => {
        el.style.transitionDelay = "0ms";
      });
    }, 2200);

    // ปุ่มจดหมายค่อยๆ โผล่
    setTimeout(() => {
      letterBtn.classList.add("show");
    }, 2400);
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
});

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bgMusic") || document.getElementById("bgm");

  const triggerAudio = () => {
    if (bgMusic) {
      bgMusic.volume = 0.5;
      bgMusic.play().then(() => {
        document.removeEventListener("click", triggerAudio);
        document.removeEventListener("touchstart", triggerAudio);
      }).catch(err => {
        console.log("Blocked:", err);
      });
    }
  };

  document.addEventListener("click", triggerAudio);
  document.addEventListener("touchstart", triggerAudio);
});