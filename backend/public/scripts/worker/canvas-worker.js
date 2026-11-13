self.onmessage = (e) => {
    switch (e.data.type) {
        case "createCanvas": createCanvas(e.data);
            break;
        case "initCanvas": initCanvas(e.data.footerOffsetHeight, e.data.clientWidth, e.data.clientHeight);
            break;
        case "startAnimation": startAnimation();
            break;
        case "onShareModeChange": onShareModeChange(e.data.active);
            break;
        case "switchAnimation": switchAnimation(e.data.animate);
            break;
    }
};

let baseColorNormal;
let baseColorShareMode;
let baseOpacityNormal;
let baseOpacityShareMode;
let speed;
let fps;

let c;
let cCtx;

let x0, y0, w, h, dw, offset;

let startTime;
let animate = true;
let currentFrame = 0;
let lastFrame;
let baseColor;
let baseOpacity;

function createCanvas(data) {
    baseColorNormal = data.baseColorNormal;
    baseColorShareMode = data.baseColorShareMode;
    baseOpacityNormal = data.baseOpacityNormal;
    baseOpacityShareMode = data.baseOpacityShareMode;
    speed = data.speed;
    fps = data.fps;

    c = data.canvas;
    cCtx = c.getContext("2d");

    lastFrame = fps / speed - 1;
    baseColor = baseColorNormal;
    baseOpacity = baseOpacityNormal;
}

function initCanvas(footerOffsetHeight, clientWidth, clientHeight) {
    let oldW = w;
    let oldH = h;
    w = clientWidth;
    h = clientHeight;

    c.width = w;
    c.height = h;
    x0 = w / 2;
    y0 = h / 2;
    dw = Math.round(Math.min(w, h) / 7);

    drawFrame(currentFrame);
}

function startAnimation() {
    startTime = Date.now();
    animateBg();
}

function switchAnimation(state) {
    if (!animate && state) {
        startTime = Date.now() - 1000 * currentFrame / fps;
    }
    animate = state;
    requestAnimationFrame(animateBg);
}

function onShareModeChange(active) {
    baseColor = active ? baseColorShareMode : baseColorNormal;
    baseOpacity = active ? baseOpacityShareMode : baseOpacityNormal;
    drawFrame(currentFrame);
}

function drawCircle(ctx, radius) {
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    let opacity = Math.max(0, baseOpacity * (1 - 0.9 * radius / Math.max(w, h)));
    ctx.strokeStyle = `rgba(${baseColor.split(' ').join(', ')}, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawCircles(ctx, frame) {
    ctx.clearRect(0, 0, w, h);
    for (let i = 6; i >= 1; i--) {
        drawCircle(ctx, dw * i + speed * dw * frame / fps);
    }
}

function drawFrame(frame) {
    cCtx.clearRect(0, 0, w, h);
    drawCircles(cCtx, frame);
}

function animateBg() {
    let now = Date.now();

    if (!animate && currentFrame === lastFrame) {
        // Animation stopped and cycle finished -> stop drawing frames
        return;
    }

    let timeSinceLastFullCycle = (now - startTime) % (1000 / speed);
    let nextFrame = Math.trunc(fps * timeSinceLastFullCycle / 1000);

    // Only draw frame if it differs from current frame
    if (nextFrame !== currentFrame) {
        drawFrame(nextFrame);
        currentFrame = nextFrame;
    }

    requestAnimationFrame(animateBg);
}