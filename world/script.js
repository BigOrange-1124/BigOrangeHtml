"use strict";

// ==================== Particle Background Class ====================
class ParticleBackground {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.min(100, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.3 - 0.15,
                speedY: Math.random() * 0.3 - 0.15,
                opacity: Math.random() * 0.5 + 0.2,
                color: ['#667eea', '#e94560', '#06b6d4'][Math.floor(Math.random() * 3)]
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            // Mouse interaction
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    particle.x -= dx * force * 0.02;
                    particle.y -= dy * force * 0.02;
                }
            }

            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Boundary bounce
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();

            // Draw connections
            this.particles.forEach(other => {
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.globalAlpha = 0.1 * (1 - distance / 120);
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            });
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// ==================== Swipe Handler Class ====================
class SwipeHandler {
    constructor(timeline) {
        this.timeline = timeline;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.scrollThrottle = null;
        this.init();
    }

    init() {
        const cardContainer = $(this.timeline.base).find('.cards-container')[0];

        // Touch events for mobile
        cardContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        cardContainer.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // Scroll events for desktop
        cardContainer.addEventListener('wheel', (e) => {
            this.handleScroll(e);
        }, { passive: false });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next card
                this.timeline._goToNextCard();
            } else {
                // Swipe right - previous card
                this.timeline._goToPrevCard();
            }
        }
    }

    handleScroll(e) {
        if (this.scrollThrottle) return;

        this.scrollThrottle = setTimeout(() => {
            if (e.deltaY > 0) {
                // Scroll down - next card
                this.timeline._goToNextCard();
            } else {
                // Scroll up - previous card
                this.timeline._goToPrevCard();
            }
            this.scrollThrottle = null;
        }, 300);

        e.preventDefault();
    }
}

// ==================== PRESTimeline Class ====================
class PRESTimeline {
    constructor(target, color) {
        this.base = target;
        this.color = color;
        this.periodContainer = $(this.base).find(".periods-container");
        this.cardContainer = $(this.base).find(".cards-container");
        this.timelineNodeContainer = $(this.base).find(".timeline-container .timeline");
        this._parseData();
        this._initialColor();
        this._generateTimeline();
        this._setStateClasses();
        this._assignBtn();
        this._adjustPeriodContainer();
        this._adjustCardContainer();
    }

    _parseData() {
        let base = this.base;
        let periods = $(base).find(".periods-container section");
        for (let section of periods) {
            section.period = $(section).attr("period");
            section.index = $(section).index();
        }
        this.periodData = periods;

        let data = $(base).find(".cards-container section");
        for (let section of data) {
            section.period = $(section).attr("period");
            section.index = $(section).index();
        }
        this.cardData = data;

        // Assign initial entry point (active items)
        this.activePeriod = this.periodData[0];
        this.activePeriodIndex = 0;
        this.activeCard = this.cardData[0];
        this.activeCardIndex = 0;
    }

    _setStateClasses() {
        // Periods
        $(this.base).find(".periods-container section.active").removeClass("active");
        $(this.base).find(".periods-container section.prev").removeClass("prev");
        $(this.base).find(".periods-container section.next").removeClass("next");
        $(this.activePeriod).addClass("active");

        if ($(this.activePeriod).prev().length != 0) {
            $(this.activePeriod).prev().addClass("prev");
            $(this.base).find(".periods-container .btn-back").removeClass("hide");
        } else {
            $(this.base).find(".periods-container .btn-back").addClass("hide");
        }
        if ($(this.activePeriod).next().length != 0) {
            $(this.activePeriod).next().addClass("next");
            $(this.base).find(".periods-container .btn-next").removeClass("hide");
        } else {
            $(this.base).find(".periods-container .btn-next").addClass("hide");
        }

        // Cards
        $(this.base).find(".cards-container section.active").removeClass("active");
        $(this.base).find(".cards-container section.prev").removeClass("prev");
        $(this.base).find(".cards-container section.next").removeClass("next");
        $(this.activeCard).addClass("active");

        if ($(this.activeCard).prev().length != 0) {
            $(this.activeCard).prev().addClass("prev");
        }
        if ($(this.activeCard).next().length != 0) {
            $(this.activeCard).next().addClass("next");
        }

        // Timeline
        $(this.base).find(".timeline li.active").removeClass("active");
        $(this.timelineData[this.activeCard.index]).addClass("active");

        let timelineB = $(this.base).find(".timeline-container .btn-back");
        let timelineN = $(this.base).find(".timeline-container .btn-next");

        if (this.activeCardIndex === 0) {
            timelineB.addClass("hide");
        } else {
            timelineB.removeClass("hide");
        }
        if (this.activeCardIndex >= this.cardData.length - 1) {
            timelineN.addClass("hide");
        } else {
            timelineN.removeClass("hide");
        }
    }

    _generateTimeline() {
        // Create node list
        let htmlWrap = "<ol></ol>";
        $(this.timelineNodeContainer).append(htmlWrap);
        let wrap = $(this.timelineNodeContainer).find("ol");
        let numNode = this.cardData.length;

        for (let i = 0; i < numNode; i++) {
            let c = this.cardData[i].color;
            let el = wrap.append('<li class="' +
                this.cardData[i].period +
                '" style="border-color: ' +
                c +
                '; --node-color: ' + c +
                '"></li>');
        }

        // Width of timeline
        let nodeW = 200;
        wrap.css("width", nodeW * numNode - 16);
        let nodeList = $(this.base).find(".timeline ol li");
        this.timelineData = nodeList;
    }

    _assignBtn() {
        let periodPrev = $(this.base).find(".periods-container .btn-back");
        let periodNext = $(this.base).find(".periods-container .btn-next");

        periodPrev.click(() => {
            if (this.activePeriodIndex > 0) {
                this.activePeriodIndex -= 1;
                this.activePeriod = this.periodData[this.activePeriodIndex];
                this._chainActions("period");
                this._setStateClasses();
            }
            this._adjustPeriodContainer();
        });

        periodNext.click(() => {
            if (this.activePeriodIndex < this.periodData.length - 1) {
                this.activePeriodIndex += 1;
                this.activePeriod = this.periodData[this.activePeriodIndex];
                this._chainActions("period");
                this._setStateClasses();
            }
            this._adjustPeriodContainer();
        });

        let timelinePrev = $(this.base).find(".timeline-container .btn-back");
        let timelineNext = $(this.base).find(".timeline-container .btn-next");

        timelinePrev.click(() => {
            if (this.activeCardIndex > 0) {
                this.activeCardIndex -= 1;
                this.activeCard = this.cardData[this.activeCardIndex];
                this._chainActions("timeline");
                this._setStateClasses();
            }
            this._adjustCardContainer();
            this._adjustPeriodContainer();
        });

        timelineNext.click(() => {
            if (this.activeCardIndex < this.cardData.length - 1) {
                this.activeCardIndex += 1;
                this.activeCard = this.cardData[this.activeCardIndex];
                this._chainActions("timeline");
                this._setStateClasses();
            }
            this._adjustCardContainer();
            this._adjustPeriodContainer();
        });

        // Assign each timeline li
        for (let i = 0; i < this.timelineData.length; i++) {
            $(this.timelineData[i]).click(() => {
                this.activeCardIndex = this.cardData[i].index;
                this.activeCard = this.cardData[this.activeCardIndex];
                this._chainActions("timeline");
                this._setStateClasses();
                this._adjustCardContainer();
                this._shiftTimeline();
            });
        }
    }

    _initialColor() {
        for (let i = 0; i < this.periodData.length; i++) {
            let p = this.periodData[i].period;
            this.periodData[i].color = this.color[p];
            let temp = this.periodData[i];

            $(temp).css({
                "border-color": temp.color,
                "box-shadow": `0 0 15px ${temp.color}, 0 0 30px ${temp.color}40`
            });
            $(temp).find(".year").css("color", temp.color);
            $(temp).find(".province").css({
                "color": temp.color,
                "text-shadow": `0 0 10px ${temp.color}`
            });

            // Cross browser bug fix
            let sbstyle = document.createElement("style");
            document.head.appendChild(sbstyle);
            sbstyle.sheet.insertRule("li." +
                p +
                ".active { background-color: " +
                this.color[p] +
                " !important } ", 0);
            sbstyle.sheet.insertRule("li." + p + "::before { background-color: " + this.color[p] + " } ", 0);
            sbstyle.sheet.insertRule("li." + p + "::after { background-color: " + this.color[p] + " } ", 0);
        }

        for (let i = 0; i < this.cardData.length; i++) {
            let p = this.cardData[i].period;
            this.cardData[i].color = this.color[p];
            let temp = this.cardData[i];

            $(temp).css({
                "border-color": temp.color,
                "box-shadow": `0 0 15px ${temp.color}, 0 0 30px ${temp.color}40`
            });
            $(temp).find(".year").css("color", temp.color);
            $(temp).find(".city").css({
                "color": temp.color,
                "text-shadow": `0 0 10px ${temp.color}`
            });
        }
    }

    _adjustPeriodContainer() {
        let activeH = $(this.activePeriod).outerHeight();
        $(this.periodContainer).height(activeH);
    }

    _adjustCardContainer() {
        let activeH = $(this.activeCard).outerHeight() + 24;
        $(this.cardContainer).height(activeH);
    }

    _shiftTimeline() {
        // Responsive timeline adjustment
        const isMobile = window.innerWidth < 768;
        const timelinePadding = isMobile ? 20 : 210;
        const activeNodeX = $(this.timelineData[this.activeCardIndex]).position().left;
        const finalPos = -activeNodeX + timelinePadding;
        $(this.timelineNodeContainer).css("left", finalPos);
    }

    _chainActions(state) {
        switch (state) {
            case "period":
                if (this.activePeriod.period != this.activeCard.period) {
                    // Find closest li with active period
                    let ta = [];
                    for (let i = 0; i < this.cardData.length; i++) {
                        let temp = this.cardData[i];
                        if (this.activePeriod.period === temp.period)
                            ta.push(temp);
                    }
                    this.activeCard = ta[0];
                    this.activeCardIndex = ta[0].index;
                }
                break;
            case "timeline":
                if (this.activeCard.period != this.activePeriod.period) {
                    let ta;
                    for (let i = 0; i < this.periodData.length; i++) {
                        let temp = this.periodData[i];
                        if (this.activeCard.period === temp.period)
                            ta = temp;
                    }
                    this.activePeriod = ta;
                    this.activePeriodIndex = ta.index;
                }
                break;
        }
        this._shiftTimeline();
        this._adjustCardContainer();
    }

    // Navigation methods for swipe/scroll
    _goToNextCard() {
        if (this.activeCardIndex < this.cardData.length - 1) {
            this.activeCardIndex += 1;
            this.activeCard = this.cardData[this.activeCardIndex];
            this._chainActions("timeline");
            this._setStateClasses();
            this._adjustCardContainer();
            this._adjustPeriodContainer();
        }
    }

    _goToPrevCard() {
        if (this.activeCardIndex > 0) {
            this.activeCardIndex -= 1;
            this.activeCard = this.cardData[this.activeCardIndex];
            this._chainActions("timeline");
            this._setStateClasses();
            this._adjustCardContainer();
            this._adjustPeriodContainer();
        }
    }
}

// ==================== Initialization ====================
$(document).ready(function () {
    let colorcode = {
        period1: "#fec541",
        period2: "#10b981",
        period3: "#667eea",
        period4: "#f97316",
        period5: "#06b6d4",
        period6: "#3b82f6",
        period7: "#84cc16",
        period8: "#a855f7",
        period9: "#6366f1",
        period10: "#ec4899",
        period11: "#e94560"
    };
    let timeline = new PRESTimeline($("#this-timeline"), colorcode);
    new SwipeHandler(timeline);
    new ParticleBackground();
});
