/* ================= I18N ================= */
var CURRENT_LANG = localStorage.getItem("db_lang") || "ru";

function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    CURRENT_LANG = lang;
    localStorage.setItem("db_lang", lang);
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
            if (btn.dataset.lang !== CURRENT_LANG) applyLang(btn.dataset.lang);
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

    tl.to(".vdodiv", { "--clip": "0%", ease: Power2 }, "a")
        .to(".slidesm", { scale: 1, ease: Power2 }, "a")
        .to(".lft", { xPercent: -10, stagger: 0.03, ease: Power4 }, "b")
        .to(".rgt", { xPercent: 10, stagger: 0.03, ease: Power4 }, "b");
}

function processPageAnimation() {
    var slides = document.querySelectorAll(".pslide");
    if (!slides.length) return;
    gsap.to(".pslide", {
        scrollTrigger: {
            trigger: ".proc",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        },
        // one full slide width per extra slide, small slack like the original
        xPercent: -(slides.length - 1) * 100 - 5,
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

/* ================= CTA form (static site: opens mail client) =================
   Replace "info@drawbridge.kz" in index.html (form action) with the real address. */
function initForm() {
    var form = document.getElementById("ctaform");
    if (!form) return;
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = new FormData(form);
        var subject = encodeURIComponent("DRAWBRIDGE — " + (data.get("company") || data.get("name") || ""));
        var body = encodeURIComponent(
            (I18N[CURRENT_LANG].f_name) + ": " + (data.get("name") || "") + "\n" +
            (I18N[CURRENT_LANG].f_company) + ": " + (data.get("company") || "") + "\n" +
            (I18N[CURRENT_LANG].f_contact) + ": " + (data.get("contact") || "") + "\n" +
            (I18N[CURRENT_LANG].f_task) + ": " + (data.get("task") || "")
        );
        window.location.href =
            form.getAttribute("action").split("?")[0] + "?subject=" + subject + "&body=" + body;
    });
}

/* ================= INIT ================= */
applyLang(CURRENT_LANG);
initLangSwitcher();
homePageAnimation();
processPageAnimation();
listHoverAnimation();
paraAnimation();
initFaq();
initForm();
bodyColorChange();

// Locomotive Scroll (kept from the original setup)
(function () {
    try {
        new LocomotiveScroll();
    } catch (e) { /* library optional */ }
})();
