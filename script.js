/* =========================================================
   DDA TEHNIK - script.js
   Berisi semua interaksi: navbar scroll, menu mobile,
   smooth scrolling, validasi form, kirim WhatsApp,
   animasi scroll reveal, tombol scroll-to-top.
   Menggunakan jQuery (sudah di-load via CDN di index.html).
   ========================================================= */

/* ---------- Konfigurasi WhatsApp ---------- */
const WA_NUMBER = '6281949350104'; // Format internasional, tanpa tanda +
const WA_DEFAULT_MSG = 'Halo DDA TEHNIK, saya ingin konsultasi layanan AC.';

/* =========================================================================
   1. Saat dokumen siap
   ========================================================================= */
 $(document).ready(function () {
  // Set tahun di footer
  $('#year').text(new Date().getFullYear());

  // Toggle menu mobile
  initMobileMenu();

  // Smooth scroll untuk link anchor
  initSmoothScroll();

  // Navbar background saat scroll
  initNavbarScroll();

  // Tombol scroll-to-top
  initScrollTop();

  // Animasi scroll reveal
  initScrollReveal();

  // Highlight nav link aktif saat scroll
  initActiveNavHighlight();

  // Form konsultasi
  initConsultForm();
});

/* =========================================================================
   2. Menu Mobile (toggle open/close)
   ========================================================================= */
function initMobileMenu() {
  const $toggle = $('#menuToggle');
  const $menu = $('#mobileMenu');
  const $iconMenu = $('#iconMenu');
  const $iconClose = $('#iconClose');

  $toggle.on('click', function () {
    $menu.slideToggle(300, function () {
      const isOpen = $(this).is(':visible');
      $toggle.attr('aria-expanded', isOpen);
      $iconMenu.toggleClass('hidden', isOpen);
      $iconClose.toggleClass('hidden', !isOpen);
    });
  });

  // Tutup menu ketika klik link mobile
  $menu.find('a[href^="#"]').on('click', function () {
    $menu.slideUp(300, function () {
      $toggle.attr('aria-expanded', false);
      $iconMenu.removeClass('hidden');
      $iconClose.addClass('hidden');
    });
  });

  // Tutup menu ketika klik di luar (di desktop, sebagai cadangan)
  $(document).on('click', function (e) {
    if ($(window).width() >= 1024) return;
    if (!$(e.target).closest('#menuToggle').length && !$(e.target).closest('#mobileMenu').length) {
      $menu.slideUp(300, function () {
        $toggle.attr('aria-expanded', false);
        $iconMenu.removeClass('hidden');
        $iconClose.addClass('hidden');
      });
    }
  });
}

/* =========================================================================
   3. Smooth Scroll untuk anchor link
   ========================================================================= */
function initSmoothScroll() {
  // CSS sudah handle scroll-behavior: smooth, tapi kita pastikan
  // dengan fallback jQuery untuk browser lama.
  $('a[href^="#"]').on('click', function (e) {
    const target = $(this).attr('href');
    if (target === '#' || target === '') return;

    const $target = $(target);
    if (!$target.length) return;

    e.preventDefault();
    const offset = 80; // Tinggi navbar
    const targetPos = $target.offset().top - offset;

    $('html, body').animate(
      { scrollTop: targetPos },
      600,
      'swing'
    );
  });
}

/* =========================================================================
   4. Navbar background saat scroll
   ========================================================================= */
function initNavbarScroll() {
  const $navbar = $('#navbar');

  function updateNavbar() {
    if ($(window).scrollTop() > 50) {
      $navbar.addClass('scrolled');
    } else {
      $navbar.removeClass('scrolled');
    }
  }

  updateNavbar();
  $(window).on('scroll', updateNavbar);
}

/* =========================================================================
   5. Tombol Scroll-to-Top
   ========================================================================= */
function initScrollTop() {
  const $btn = $('#scrollTop');

  function updateButton() {
    if ($(window).scrollTop() > 500) {
      $btn.addClass('visible');
    } else {
      $btn.removeClass('visible');
    }
  }

  updateButton();
  $(window).on('scroll', updateButton);

  $btn.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
  });
}

/* =========================================================================
   6. Animasi scroll reveal (menggunakan IntersectionObserver + fallback jQuery)
   ========================================================================= */
function initScrollReveal() {
  const $sections = $('.section-reveal');

  // Cek apakah IntersectionObserver didukung
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $(entry.target).addClass('revealed');
            observer.unobserve(entry.target); // hanya sekali
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    $sections.each(function () {
      observer.observe(this);
    });
  } else {
    // Fallback: tampilkan semua
    $sections.addClass('revealed');
  }
}

/* =========================================================================
   7. Highlight nav link aktif saat scroll
   ========================================================================= */
function initActiveNavHighlight() {
  // Tidak dipakai menambah class active karena style belum disiapkan,
  // tapi kita bisa track untuk kebutuhan lain jika diperlukan.
  const sections = $('section[id]');
  const navLinks = $('.nav-link');

  if (!sections.length || !navLinks.length) return;

  $(window).on('scroll', function () {
    const scrollPos = $(window).scrollTop() + 100;
    sections.each(function () {
      const $section = $(this);
      const top = $section.offset().top;
      const bottom = top + $section.outerHeight();
      const id = $section.attr('id');
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.removeClass('text-gold');
        navLinks.filter('[href="#' + id + '"]').addClass('text-gold');
      }
    });
  });
}

/* =========================================================================
   8. Form Konsultasi - Validasi + Kirim WhatsApp
   ========================================================================= */
function initConsultForm() {
  const $form = $('#consultForm');
  const $message = $('#formMessage');

  $form.on('submit', function (e) {
    e.preventDefault();

    // Reset tampilan error
    $('.form-input').removeClass('error');
    $message.addClass('hidden').removeClass('bg-red-50 text-red-700 bg-green-50 text-green-700');

    // Ambil nilai field
    const name = $('#name').val().trim();
    const phone = $('#phone').val().trim();
    const location = $('#location').val();
    const service = $('#service').val();
    const acType = $('#acType').val();
    const units = $('#units').val().trim();
    const notes = $('#notes').val().trim();

    // Validasi field wajib
    const errors = [];
    if (!name) {
      errors.push({ id: 'name', msg: 'Nama lengkap wajib diisi.' });
    }
    if (!phone) {
      errors.push({ id: 'phone', msg: 'No. WhatsApp wajib diisi.' });
    } else if (!isValidPhone(phone)) {
      errors.push({ id: 'phone', msg: 'Format nomor WhatsApp tidak valid. Contoh: 08123456789' });
    }
    if (!location) {
      errors.push({ id: 'location', msg: 'Lokasi wajib dipilih.' });
    }
    if (!service) {
      errors.push({ id: 'service', msg: 'Jenis layanan wajib dipilih.' });
    }
    if (!acType) {
      errors.push({ id: 'acType', msg: 'Jenis AC wajib dipilih.' });
    }
    if (!units) {
      errors.push({ id: 'units', msg: 'Jumlah unit wajib diisi.' });
    } else if (parseInt(units, 10) < 1) {
      errors.push({ id: 'units', msg: 'Jumlah unit minimal 1.' });
    }

    // Jika ada error, tampilkan dan stop
    if (errors.length > 0) {
      // Tandai input yang error
      errors.forEach(function (err) {
        $('#' + err.id).addClass('error');
      });
      // Tampilkan pesan error pertama
      showFormMessage('error', errors[0].msg);
      // Fokus ke field error pertama
      $('#' + errors[0].id).focus();
      return;
    }

    // Susun pesan WhatsApp yang rapi
    const waMessage = buildWhatsAppMessage({
      name: name,
      phone: phone,
      location: location,
      service: service,
      acType: acType,
      units: units,
      notes: notes,
    });

    // Encode dan buka WhatsApp
    const waUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waMessage);

    // Tampilkan pesan sukses terlebih dahulu, lalu buka WhatsApp
    showFormMessage('success', 'Membuka WhatsApp... Jika tidak otomatis terbuka, klik tombol di bawah.');

    // Buka WhatsApp di tab baru
    setTimeout(function () {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 300);
  });

  // Hilangkan state error saat user mulai mengetik ulang
  $form.on('input change', '.form-input', function () {
    $(this).removeClass('error');
    $message.addClass('hidden');
  });
}

/* ---------- Validasi nomor WhatsApp (Indonesia) ---------- */
function isValidPhone(phone) {
  // Bersihkan spasi, dash, plus
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // Pola: mulai dengan 08 atau 628, lalu 8-13 digit
  const pattern = /^(08|628)[0-9]{7,13}$/;
  return pattern.test(cleaned);
}

/* ---------- Bangun pesan WhatsApp dari data form ---------- */
function buildWhatsAppMessage(data) {
  let msg = 'Halo DDA TEHNIK, saya ingin konsultasi layanan AC.\n\n';
  msg += 'Berikut detail kebutuhan saya:\n';
  msg += '• Nama: ' + data.name + '\n';
  msg += '• No. WhatsApp: ' + data.phone + '\n';
  msg += '• Lokasi: ' + data.location + '\n';
  msg += '• Jenis Layanan: ' + data.service + '\n';
  msg += '• Jenis AC: ' + data.acType + '\n';
  msg += '• Jumlah Unit: ' + data.units + '\n';
  if (data.notes) {
    msg += '• Catatan: ' + data.notes + '\n';
  }
  msg += '\nMohon informasi penawaran / survey lebih lanjut. Terima kasih.';
  return msg;
}

/* ---------- Tampilkan pesan form di dalam element #formMessage ---------- */
function showFormMessage(type, text) {
  const $msg = $('#formMessage');
  $msg.removeClass('hidden bg-red-50 text-red-700 bg-green-50 text-green-700 border-red-200 border-green-200');

  if (type === 'error') {
    $msg.addClass('bg-red-50 text-red-700 border border-red-200').text('⚠ ' + text);
  } else if (type === 'success') {
    $msg.addClass('bg-green-50 text-green-700 border border-green-200').text('✓ ' + text);
  }

  // Sembunyikan otomatis setelah 5 detik
  setTimeout(function () {
    $msg.addClass('hidden');
  }, 5000);
}

/* =========================================================================
   9. Lazy-load fallback untuk gambar (jika browser tidak mendukung)
   ========================================================================= */
if (!('loading' in HTMLImageElement.prototype)) {
  // Browser lama: tetap load semua gambar dengan immediate
  $('img[loading="lazy"]').each(function () {
    $(this).attr('loading', 'eager');
  });
}