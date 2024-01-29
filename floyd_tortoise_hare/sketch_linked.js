let startGap = 100;
let nodesGap = 70;
let circleRadius = 30;
const triangleSize = 7;
const rectangleWidth = nodesGap - circleRadius / 2;
const fontWeight = 20;

let LINEAR_NODE_COUNT = 10;
let CIRCULAR_NODE_COUNT = 6;
let HARE_COLOR = [255, 0, 0];
let TORTOISE_COLOR = [0, 255, 0];
let TURTLE_COLOR = [10, 10, 255];
let NODE_COLOR = [50, 100, 50];
let BACKGROUND_COLOR = [0, 0, 0];

let automatic = false;

let harePointer, tortoisePointer, turtlePointer;
let intervalPtr;
let centerOfCircles = [];
let centerX, centerY;
let meetingIndex;

function setup() {
    createCanvas(windowWidth, windowHeight);
    restartSketch();
}

function restartSketch() {
    LINEAR_NODE_COUNT = parseInt(document.getElementById("linearNodeCount").value, 10) || LINEAR_NODE_COUNT;
    CIRCULAR_NODE_COUNT = parseInt(document.getElementById("circularNodeCount").value, 10) || CIRCULAR_NODE_COUNT;
    HARE_COLOR = hexToRgb(document.getElementById("hareColor").value) || HARE_COLOR;
    TORTOISE_COLOR = hexToRgb(document.getElementById("tortoiseColor").value) || TORTOISE_COLOR;
    TURTLE_COLOR = hexToRgb(document.getElementById("turtleColor").value) || TURTLE_COLOR;
    NODE_COLOR = hexToRgb(document.getElementById("nodeColor").value) || [50, 100, 50];
    BACKGROUND_COLOR = hexToRgb(document.getElementById("backgroundColor").value) || [0, 0, 0];
    centerOfCircles = [];

    background(...BACKGROUND_COLOR);
    angleMode(DEGREES);

    allNodes();

    fill(255);
    markStart();
    clearPointers();
    initPointers();
    harePointer.placePointer();
    tortoisePointer.placePointer();
    intervalPtr = setInterval(moveHareTortoise, 500);
}

function hexToRgb(hex) {
    // Convert hex color to RGB
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

function draw() {
    addData("Hare\t\t\t", harePointer, startGap + nodesGap, height / 2 - 300, 20);
    addData("Tortoise", tortoisePointer, startGap + nodesGap, height / 2 - 250, 20);
    addData("Turtle\t\t", turtlePointer, startGap + nodesGap, height / 2 - 200, 20);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function moveForward(pointer1, pointer2, callback) {
    pointer1.moveToNextStep();
    pointer2.moveToNextStep();
    if (pointer1.placementIndex === pointer2.placementIndex) {
        callback(pointer1.placementIndex);
    }
}

function moveTurtleTortoise() {
    moveForward(tortoisePointer, turtlePointer, (index) => {
        if (intervalPtr) {
            fill(0);
            circle(centerOfCircles[index][0], centerOfCircles[index][1], circleRadius);
            clearInterval(intervalPtr);
            putMarker(index, 127);
        }
    });
}

function moveHareTortoise() {
    moveForward(harePointer, tortoisePointer, (index) => {
        if (intervalPtr) {
            markNode(index);
            meetingIndex = index;
            clearInterval(intervalPtr);
            turtlePointer.placePointer();
            intervalPtr = setInterval(moveTurtleTortoise, 1000);
            setTimeout(() => {
                markNode(index, HARE_COLOR);
                putMarker(index);
            }, 800);
        }
    });
}

function putMarker(index, fillColor = 255) {
    textStyle(BOLD);
    fill(fillColor);
    addText(`${index + 1}`, centerOfCircles[index][0], centerOfCircles[index][1]);
    textStyle(NORMAL);
}

function markNode(index, markcolor = 255) {
    fill(markcolor);
    circle(centerOfCircles[index][0], centerOfCircles[index][1], circleRadius);
}

function initPointers() {
    harePointer = new Pointer(HARE_COLOR, 2, 1, 0);
    tortoisePointer = new Pointer(TORTOISE_COLOR, 1, -1, 0);
    turtlePointer = new Pointer(TURTLE_COLOR, 1, 1, 0);
}

function clearPointers() {
    harePointer = null;
    tortoisePointer = null;
    turtlePointer = null;

    if (intervalPtr) clearInterval(intervalPtr);
}

function Pointer(color, steps, placement, nodeCount = 0) {
    this.color = color;
    this._steps = steps;
    this._nodeTravelCount = nodeCount;
    this.placement = placement;
    Object.defineProperties(this, {
        placementIndex: {
            get: function () {
                return this._nodeTravelCount >= LINEAR_NODE_COUNT
                    ? ((this._nodeTravelCount - LINEAR_NODE_COUNT) % CIRCULAR_NODE_COUNT) + LINEAR_NODE_COUNT
                    : this._nodeTravelCount;
            },
        },
        stepCount: {
            get: function () {
                return this._nodeTravelCount;
            },
        },
    });
    this.getNextStep = function () {
        this._nodeTravelCount = this._nodeTravelCount + this._steps;
        return this._nodeTravelCount;
    };
    this.placePointer = function (color = this.color, radius = 15) {
        fill([...color]);
        circle(
            centerOfCircles[this.placementIndex][0],
            centerOfCircles[this.placementIndex][1] - circleRadius * placement,
            radius
        );
        fill(255);
    };
    this.moveToNextStep = function () {
        this.removePointer();
        this.getNextStep();
        this.placePointer();
    };
    this.removePointer = function (steps = 1) {
        fill(BACKGROUND_COLOR);
        this.placePointer(BACKGROUND_COLOR, 16);
        fill([...this.color]);
    };
}

function markStart() {
    addText("start", centerOfCircles[0][0] - circleRadius * 1.5, centerOfCircles[0][1], 20);
}

function addData(displayText, pointer, start, end, fontweight) {
    fill(...BACKGROUND_COLOR);
    rect(0, end - fontweight / 2, width, fontweight + 2);
    const outputStr = `${displayText} \t\t\t\t node no: ${pointer.placementIndex + 1} \t\t\t\t\t\t\t steps: ${
        pointer.stepCount
    }`;
    addText(outputStr, start + 100, end, fontweight);
}

function addText(text_string, start, end, fontweight = fontWeight) {
    textSize(fontweight);
    fill(255);
    stroke(0);
    textAlign(CENTER, CENTER);
    text(text_string, start, end);
}

function allNodes() {
    linearNodes();
    cyclicNodes(45, CIRCULAR_NODE_COUNT);
}

function linearNodes() {
    const centerY = height / 2;

    for (let i = 0; i < LINEAR_NODE_COUNT; i++) {
        centerX = getNextLinearCenter(i);
        drawArrow(centerX, centerY, rectangleWidth);
        drawNode(centerX, centerY, circleRadius);
    }
    drawNode(getNextLinearCenter(LINEAR_NODE_COUNT), height / 2, circleRadius);
}

function getNextLinearCenter(i) {
    return startGap + nodesGap * i;
}

function drawNode(centerX, centerY, circle_radius) {
    fill([...NODE_COLOR]);
    centerOfCircles.push([centerX, centerY]);
    circle(centerX, centerY, circle_radius);
    addText(`${centerOfCircles.length}`, centerX, centerY);
}

function cyclicNodesThree(angle) {
    centerX = getNextLinearCenter(LINEAR_NODE_COUNT);
    drawAngularArrow(centerX, height / 2, angle);

    centerY = height / 2 + getAngularDistance();

    centerX += getNextAngularCenter();
    drawAngularNode(centerX, centerY, -angle);

    centerX += getNextAngularCenter();
    centerY = height / 2;
    drawAngularNode(centerX, centerY, 180, 1.8);
}

function cyclicNodes(angle, nodeCount) {
    if (nodeCount <= 3) {
        cyclicNodesThree(angle);
        return;
    }

    const bottomDivide = ceil((nodeCount - 4) / 2);
    const topDivide = floor((nodeCount - 4) / 2);

    centerX = getNextLinearCenter(LINEAR_NODE_COUNT);
    drawAngularArrow(centerX, height / 2, angle);

    cyclicHalf(bottomDivide, 1, 0, angle);

    // THE CENTER NODE
    centerX += getNextAngularCenter();
    centerY = height / 2;
    drawAngularNode(centerX, centerY, 270 - angle);

    if (nodeCount == 5) {
        centerX += getNextAngularCenter() * -1;
        centerY = height / 2 + getAngularDistance() * -1;
        drawAngularNode(centerX, centerY, 160, (1.9 * nodesGap) / rectangleWidth);

        return;
    }

    cyclicHalf(topDivide, -1, 180, angle, bottomDivide / topDivide);
}

function cyclicHalf(nodeCount, direction, angleAdj, angle, factor = 1) {
    centerX += getNextAngularCenter() * direction;
    centerY = height / 2 + getAngularDistance() * direction;

    for (let i = 0; i < nodeCount; i++) {
        drawAngularNode(centerX, centerY, angleAdj, factor > 1 ? (factor * nodesGap) / rectangleWidth : 1);
        centerX += nodesGap * direction * factor;
    }

    drawAngularNode(centerX, centerY, angleAdj - angle);
}

function getNextAngularCenter() {
    return rectangleWidth - triangleSize / 2;
}

function getAngularDistance() {
    return int(sin(45) * nodesGap);
}

function drawAngularNode(centerX, centerY, angle, factor = 1) {
    drawAngularArrow(centerX, centerY, angle, factor);
    drawNode(centerX, centerY, circleRadius);
}

function drawAngularArrow(centerX, centerY, angle, factor = 1) {
    push();
    translate(centerX, centerY);
    rotate(angle);
    drawArrow(circleRadius / 2, 0, (rectangleWidth - circleRadius / 2) * factor);
    pop();
}

function getNextTriangleHead(centerX, centerY, rectangle_width) {
    const triangle_startX = centerX + rectangle_width - 2;
    return [
        {
            x: triangle_startX + 3,
            y: centerY,
        },
        {
            x: triangle_startX - triangleSize,
            y: centerY - triangleSize,
        },
        {
            x: triangle_startX - triangleSize,
            y: centerY + triangleSize,
        },
    ];
}

function drawArrow(centerX, centerY, rectangle_width) {
    noStroke();
    fill(200, 200, 200);
    const triangle_points = getNextTriangleHead(centerX, centerY, rectangle_width);
    rect(centerX, centerY - 3, rectangle_width - 5, 5);
    triangle(
        triangle_points[0].x,
        triangle_points[0].y,
        triangle_points[1].x,
        triangle_points[1].y,
        triangle_points[2].x,
        triangle_points[2].y
    );
}
