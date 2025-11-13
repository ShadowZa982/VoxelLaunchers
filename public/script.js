// === IMAGE SLIDER ===
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
function showSlide(n) {
  slides.forEach((slide, i) => {
    slide.style.opacity = '0';
    slide.style.zIndex = '1';
    dots[i].classList.remove('active');
  });
  if (slides[n]) {
    slides[n].style.opacity = '1';
    slides[n].style.zIndex = '2';
    dots[n].classList.add('active');
  }
}
function nextSlide() {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}
// Khởi động slider
if (slides.length > 0) {
  showSlide(slideIndex);
  setInterval(nextSlide, 4000);
}
// Click dot
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    slideIndex = i;
    showSlide(slideIndex);
  });
});
// === FADE-IN KHI SCROLL ===
const fadeElems = document.querySelectorAll('.fade-in');
const footer = document.querySelector('.footer');
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, observerOptions);
fadeElems.forEach(el => observer.observe(el));
if (footer) observer.observe(footer);
// === MOBILE MENU & SMOOTH SCROLL ===
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const closeBtn = document.querySelector('.close-btn');
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);
function toggleMobileMenu(open) {
  hamburger.classList.toggle('active', open);
  mobileMenu.classList.toggle('active', open);
  overlay.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
hamburger?.addEventListener('click', () => toggleMobileMenu(true));
closeBtn?.addEventListener('click', () => toggleMobileMenu(false));
overlay.addEventListener('click', () => toggleMobileMenu(false));
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    if (mobileMenu?.classList.contains('active')) {
      toggleMobileMenu(false);
    }
  });
});
// === HIỆU ỨNG ĐÁNH CHỮ ===
document.addEventListener("DOMContentLoaded", function () {
  const textElement = document.querySelector(".typewriter-text");
  if (!textElement) return;
  const cursor = document.querySelector(".cursor");
  const fullText = textElement.getAttribute("data-text") || "";
  textElement.textContent = "";
  textElement.style.opacity = "0";
  cursor.classList.remove("hidden");
  let i = 0;
  const typingSpeed = 30;
  function typeWriter() {
    if (i < fullText.length) {
      textElement.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeWriter, typingSpeed);
    } else {
      textElement.classList.add("typing");
      cursor.classList.add("hidden");
    }
  }
  const container = textElement.closest('.typewriter-container');
  const typingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && i === 0) {
        textElement.style.opacity = "1";
        typeWriter();
        typingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  typingObserver.observe(container);
});
// === POPUP TẢI XUỐNG + ĐẾM NGƯỢC + NÚT XÁC NHẬN ===
const downloadBtns = document.querySelectorAll('.btn-download');
const popup = document.getElementById('download-popup');
const progressBar = document.getElementById('progress-bar');
const countdownEl = document.getElementById('countdown');
let countdownInterval, progressInterval;
let timeLeft = 10;
let redirectUrl = '';
let confirmBtn;
// === ĐẾM LƯỢT TẢI THẬT (SQLite via API) ===
const downloadCountEl = document.getElementById('download-count');
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 100000) return Math.floor(num / 1000) + 'k';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  return num.toLocaleString('vi-VN');
}
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
}
async function loadDownloadCount() {
  try {
    const data = await fetchWithRetry('/api/get-downloads?t=' + Date.now());
    if (data && typeof data.count === 'number') {
      downloadCountEl.textContent = formatNumber(data.count);
    } else {
      throw new Error('Invalid data');
    }
  } catch (err) {
    downloadCountEl.textContent = '???';
    console.warn('Không tải được lượt tải, thử lại sau 5s...');
    setTimeout(loadDownloadCount, 5000);
  }
}
async function incrementDownload() {
  try {
    const data = await fetchWithRetry('/api/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, 2);
    if (data.success && typeof data.count === 'number') {
      downloadCountEl.textContent = formatNumber(data.count);
      // Hiệu ứng nhảy số
      downloadCountEl.style.transition = 'transform 0.2s, color 0.2s';
      downloadCountEl.style.transform = 'scale(1.4)';
      downloadCountEl.style.color = '#c084fc';
      setTimeout(() => {
        downloadCountEl.style.transform = 'scale(1)';
        downloadCountEl.style.color = 'var(--primary-purple)';
      }, 300);
    }
  } catch (err) {
    console.error('Lỗi tăng lượt tải:', err);
  }
}
// TẢI LƯỢT TẢI KHI MỞ TRANG
loadDownloadCount();
// === XỬ LÝ NÚT TẢI XUỐNG ===
downloadBtns.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const redirect = btn.getAttribute('data-redirect');
    if (!redirect) return;
    e.preventDefault();
    // Tăng lượt tải ngay lập tức
    await incrementDownload();
    // Hiển thị popup
    redirectUrl = redirect;
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Reset
    timeLeft = 10;
    countdownEl.textContent = timeLeft;
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.3s ease';
    // Xóa nút cũ
    if (confirmBtn && confirmBtn.parentNode) {
      confirmBtn.remove();
    }
    // Tạo nút xác nhận
    confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Đang chờ...';
    confirmBtn.className = 'btn-confirm disabled';
    confirmBtn.disabled = true;
    document.querySelector('.popup-content').appendChild(confirmBtn);
    // Dừng interval cũ
    clearInterval(countdownInterval);
    clearInterval(progressInterval);
    // ĐẾM NGƯỢC
    countdownInterval = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      progressBar.style.width = `${((10 - timeLeft) / 10) * 100}%`;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        clearInterval(progressInterval);
        countdownEl.textContent = "Hoàn tất!";
        progressBar.style.width = '100%';
        confirmBtn.textContent = 'Bắt đầu tải xuống';
        confirmBtn.classList.remove('disabled');
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => startRedirect(redirectUrl);
      }
    }, 1000);
    // Thanh progress mượt
    progressInterval = setInterval(() => {
      const current = parseFloat(progressBar.style.width) || 0;
      if (current < 100 && timeLeft > 0) {
        progressBar.style.width = `${current + 1}%`;
      }
    }, 100);
  });
});
// === ĐÓNG POPUP ===
function closePopup() {
  popup.classList.remove('active');
  document.body.style.overflow = '';
  clearInterval(countdownInterval);
  clearInterval(progressInterval);
  redirectUrl = '';
  if (confirmBtn && confirmBtn.parentNode) {
    confirmBtn.remove();
  }
}
// === MỞ LINK TẢI ===
function startRedirect(url) {
  window.location.href = url;  // Chuyển hướng trực tiếp thay vì open _blank
  setTimeout(closePopup, 800);
}
// Đóng popup khi nhấn ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popup.classList.contains('active')) {
    closePopup();
  }
});