
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let hd = document.getElementById('hidden');

let isActive = false;
let newX = 0;
let newY = 0;

const rect = canvas.getBoundingClientRect();

canvas.addEventListener('mousedown', el => {
    newX = el.clientX - rect.left;
    newY = el.clientY - rect.top;
    isActive = true;
});

canvas.addEventListener('mousemove', el => {
    if (isActive === true) {
        drawLine(context, newX, newY, el.clientX - rect.left, el.clientY - rect.top);
        newX = el.clientX - rect.left;
        newY = el.clientY - rect.top;
        let canvasUrl = canvas.toDataURL();
        hd.value = canvasUrl;
    }
});

window.addEventListener('mouseup', el => {
    if (isActive === true) {
        drawLine(context, newX, newY, el.clientX - rect.left, el.clientY - rect.top);
        newX = 0;
        newY = 0;
        isActive = false;
    }
});

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}