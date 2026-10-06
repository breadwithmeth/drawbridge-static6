/* ================= I18N ================= */
/* Language is determined by the URL path (/ => ru, /en/ => en, /kz/ => kz).
   DB_DEFAULT_LANG lets static copies (e.g. local preview) pin a language. */
function dbLangFromPath() {
    if (window.DB_DEFAULT_LANG) return window.DB_DEFAULT_LANG;
    var p = location.pathname;
    if (p.indexOf("/en") === 0) return "en";
    if (p.indexOf("/kz") === 0) return "kz";
    return "ru";
}
var CURRENT_LANG = dbLangFromPath();

function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    CURRENT_LANG = lang;
    document.documentElement.setAttribute("lang", lang === "kz" ? "kk" : lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
        var key = el.getAttribute("data-i18n");
        if (I18N[lang][key] !== undefined) el.textContent = I18N[lang][key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
        var key = el.getAttribute("data-i18n-html");
        if (I18N[lang][key] !== undefined) el.innerHTML = I18N[lang][key];
    });

    document.querySelectorAll(".langbtn").forEach(function (btn) {
        btn.classList.toggle("opacity-40", btn.dataset.lang !== lang);
    });

    // Rebuild text-dependent animations for the new language
    var para = document.querySelector(".textpara");
    if (para) {
        gsap.set(para, { clearProps: "all" });
        paraAnimation();
    }
}

function initLangSwitcher() {
    document.querySelectorAll(".langbtn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (btn.dataset.lang !== CURRENT_LANG) {
                // Navigate to the language folder so each language has its own indexable URL
                var l = btn.dataset.lang;
                window.location.href = (l === "ru") ? "/" : "/" + l + "/";
            }
        });
    });
}

/* ================= ANIMATIONS ================= */
gsap.registerPlugin(ScrollTrigger);

function homePageAnimation() {
    gsap.set(".slidesm", { scale: 4 });
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".home",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
        },
    });

    tl.to(".vdodiv", { "--clip": "0%", ease: Power2, duration: 1.2 }, "a")
        .to(".slidesm", { scale: 1, ease: Power2, duration: 1.2 }, "a")
        .to(".heading", { opacity: 0, y: -60, ease: Power2, duration: 0.6 }, "a+=0.5")
        .to(".btmtext", { opacity: 0, ease: Power2, duration: 0.4 }, "a+=0.6");
}

/* Infinite marquee: rows scroll continuously, lft → left, rgt → right.
   Content is duplicated for a seamless -50% loop; motion is driven by GSAP
   so the speed and skew can react to the user's scroll velocity (#6). */
function marqueeLoop() {
    var rows = [];
    document.querySelectorAll(".row").forEach(function (row) {
        var original = row.innerHTML;
        while (row.scrollWidth < window.innerWidth * 2.2) {
            row.innerHTML += original;
        }
        rows.push(row);
    });

    var tweens = rows.map(function (row) {
        var toLeft = row.classList.contains("lft");
        var half = row.scrollWidth / 2; // px of one content copy
        // base drift ~90px/s, lft moves left, rgt moves right
        return gsap.fromTo(row,
            { x: toLeft ? 0 : -half },
            {
                x: toLeft ? -half : 0,
                duration: half / 90,
                ease: "none",
                repeat: -1,
            });
    });

    // Scroll velocity → extra speed + skew, smoothly returning to base drift
    var speed = { v: 1 };   // timeScale multiplier
    var skew = { v: 0 };    // skewX degrees

    ScrollTrigger.create({
        onUpdate: function (self) {
            var v = self.getVelocity();
            // boost: 1 → up to ~4x at fast scroll
            gsap.to(speed, { v: 1 + Math.min(Math.abs(v) / 900, 3), duration: 0.3, overwrite: true });
            gsap.to(skew, {
                v: gsap.utils.clamp(-14, 14, v / -180),
                duration: 0.4,
                overwrite: true,
            });
        },
    });

    gsap.ticker.add(function () {
        // ease the boost and skew back to normal when scrolling stops
        speed.v += (1 - speed.v) * 0.06;
        skew.v += (0 - skew.v) * 0.08;
        tweens.forEach(function (tween, i) {
            var row = rows[i];
            var dir = row.classList.contains("lft") ? -1 : 1;
            tween.timeScale(speed.v);
            row.style.transform = "translateX(" + gsap.getProperty(row, "x") + "px)" +
                " skewX(" + (skew.v * dir) + "deg)";
        });
    });
}

function processPageAnimation() {
    var slides = document.querySelectorAll(".pslide");
    if (!slides.length) return;
    var track = document.querySelector(".pslides");
    // shift by the exact width of (n-1) slides + the gaps between them,
    // recalculated on resize so the last slide is always fully visible
    gsap.to(".pslide", {
        scrollTrigger: {
            trigger: ".proc",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
        },
        x: function () {
            var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            var w = slides[0].getBoundingClientRect().width;
            return -((slides.length - 1) * (w + gap));
        },
        ease: Power4,
    });
}

function listHoverAnimation() {
    document.querySelectorAll(".listelem").forEach(function (el) {
        var layer = el.querySelector(".bluelayer");
        el.addEventListener("mouseenter", function () {
            gsap.to(layer, { height: "100%", ease: Power4, duration: 0.4 });
        });
        el.addEventListener("mouseleave", function () {
            gsap.to(layer, { height: "0%", ease: Power4, duration: 0.4 });
        });
    });
}

function paraAnimation() {
    var para = document.querySelector(".textpara");
    if (!para) return;
    var clutter = "";
    para.textContent
        .split("")
        .forEach(function (e) {
            if (e === " ") clutter += `<span>&nbsp;</span>`;
            clutter += `<span>${e}</span>`;
        });
    para.innerHTML = clutter;

    gsap.set(".textpara span", { opacity: 0.1 });
    gsap.to(".textpara span", {
        scrollTrigger: {
            trigger: ".textpara",
            start: "top 70%",
            end: "bottom 80%",
            scrub: 2,
        },
        opacity: 1,
        stagger: 0.03,
        ease: Power4,
    });
}

function bodyColorChange() {
    document.querySelectorAll(".section").forEach(function (e) {
        ScrollTrigger.create({
            trigger: e,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: function () {
                document.body.setAttribute("theme", e.dataset.color);
            },
            onEnterBack: function () {
                document.body.setAttribute("theme", e.dataset.color);
            },
        });
    });
}

/* ================= FAQ accordion ================= */
function initFaq() {
    document.querySelectorAll(".faqitem").forEach(function (item) {
        var btn = item.querySelector(".faqq");
        var answer = item.querySelector(".faqa");
        var ico = item.querySelector(".faqico");
        var open = false;
        btn.addEventListener("click", function () {
            open = !open;
            gsap.to(answer, { height: open ? "auto" : 0, duration: 0.35, ease: Power2 });
            ico.textContent = open ? "−" : "+";
        });
    });
}


/* ================= INIT ================= */
applyLang(CURRENT_LANG);
initLangSwitcher();
homePageAnimation();
marqueeLoop();
processPageAnimation();
listHoverAnimation();
paraAnimation();
initFaq();
bodyColorChange();

// Locomotive Scroll (kept from the original setup)
(function () {
    try {
        new LocomotiveScroll();
    } catch (e) { /* library optional */ }
})();
