let nodes = [];
const repulsionForce = 4;
const nodeCount = 60;
const connectionLength = 100;
const nodeSize = 2;

// 定义渐变的起始和结束颜色
let startColor;
let endColor;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node(random(width), random(height)));
    }
    // 设置渐变色，开始为绿色，结束为蓝色
    startColor = color(0, 255, 0);
    endColor = color(0, 0, 205);
}

function draw() {
    background(240);
    for (let node of nodes) {
        node.move();
        node.display();
    }
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            if (d < connectionLength) {
                let lerpAmt = map(d, 0, connectionLength, 0, 1);
                let newColor = lerpColor(startColor, endColor, lerpAmt);
                // 设置透明度为 70%
                stroke(red(newColor), green(newColor), blue(newColor), 48);
                line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            }
        }
    }
}


function mousePressed() {
    for (let node of nodes) {
        let d = dist(mouseX, mouseY, node.x, node.y);
        if (d < 50) {
            let angle = atan2(node.y - mouseY, node.x - mouseX);
            node.vx += cos(angle) * repulsionForce;
            node.vy += sin(angle) * repulsionForce;
        }
    }
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = random(-0.5, 0.5);
        this.vy = random(-0.5, 0.5);
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x <= 0 || this.x >= width) {
            this.vx *= -1;
        }
        if (this.y <= 0 || this.y >= height) {
            this.vy *= -1;
        }
    }

    display() {
        noStroke();
        fill(100, 100, 200);
        ellipse(this.x, this.y, nodeSize, nodeSize);
    }
}