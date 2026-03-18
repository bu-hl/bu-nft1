const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outputDir = path.join(__dirname, "..", "images", "generated");
const IMAGE_SIZE = 512;

function createRng(seed) {
    let state = seed >>> 0;

    return function next() {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function toColor(hex) {
    const value = hex.replace("#", "");
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
        a: 255
    };
}

function blend(colorA, colorB, t) {
    return {
        r: Math.round(colorA.r + (colorB.r - colorA.r) * t),
        g: Math.round(colorA.g + (colorB.g - colorA.g) * t),
        b: Math.round(colorA.b + (colorB.b - colorA.b) * t),
        a: 255
    };
}

function createCanvas(width, height, color) {
    const pixels = Buffer.alloc(width * height * 4);

    for (let i = 0; i < width * height; i += 1) {
        pixels[i * 4] = color.r;
        pixels[i * 4 + 1] = color.g;
        pixels[i * 4 + 2] = color.b;
        pixels[i * 4 + 3] = color.a;
    }

    return { width, height, pixels };
}

function setPixel(canvas, x, y, color) {
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return;
    }

    const index = (y * canvas.width + x) * 4;
    canvas.pixels[index] = color.r;
    canvas.pixels[index + 1] = color.g;
    canvas.pixels[index + 2] = color.b;
    canvas.pixels[index + 3] = color.a ?? 255;
}

function fillRect(canvas, x, y, width, height, color) {
    const xStart = Math.max(0, Math.floor(x));
    const yStart = Math.max(0, Math.floor(y));
    const xEnd = Math.min(canvas.width, Math.ceil(x + width));
    const yEnd = Math.min(canvas.height, Math.ceil(y + height));

    for (let py = yStart; py < yEnd; py += 1) {
        for (let px = xStart; px < xEnd; px += 1) {
            setPixel(canvas, px, py, color);
        }
    }
}

function fillCircle(canvas, cx, cy, radius, color) {
    const xStart = Math.max(0, Math.floor(cx - radius));
    const yStart = Math.max(0, Math.floor(cy - radius));
    const xEnd = Math.min(canvas.width, Math.ceil(cx + radius));
    const yEnd = Math.min(canvas.height, Math.ceil(cy + radius));
    const radiusSquared = radius * radius;

    for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
            const dx = x - cx;
            const dy = y - cy;

            if (dx * dx + dy * dy <= radiusSquared) {
                setPixel(canvas, x, y, color);
            }
        }
    }
}

function fillEllipse(canvas, cx, cy, rx, ry, color) {
    const xStart = Math.max(0, Math.floor(cx - rx));
    const yStart = Math.max(0, Math.floor(cy - ry));
    const xEnd = Math.min(canvas.width, Math.ceil(cx + rx));
    const yEnd = Math.min(canvas.height, Math.ceil(cy + ry));

    for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
            const dx = (x - cx) / rx;
            const dy = (y - cy) / ry;

            if (dx * dx + dy * dy <= 1) {
                setPixel(canvas, x, y, color);
            }
        }
    }
}

function drawBackground(canvas, topColor, bottomColor) {
    for (let y = 0; y < canvas.height; y += 1) {
        const t = y / (canvas.height - 1);
        const color = blend(topColor, bottomColor, t);

        for (let x = 0; x < canvas.width; x += 1) {
            setPixel(canvas, x, y, color);
        }
    }
}

function drawSparkles(canvas, rng) {
    const count = 18;
    const white = toColor("#FFFFFF");

    for (let i = 0; i < count; i += 1) {
        const x = Math.floor(rng() * canvas.width);
        const y = Math.floor(rng() * (canvas.height * 0.55));
        const size = 2 + Math.floor(rng() * 4);

        fillRect(canvas, x - size, y, size * 2 + 1, 1, white);
        fillRect(canvas, x, y - size, 1, size * 2 + 1, white);
    }
}

function drawCharacter(canvas, tokenId) {
    const rng = createRng(tokenId * 2654435761);
    const skinTones = ["#F2D3B1", "#E7BE97", "#D9A272", "#B87952"];
    const hairColors = ["#24160F", "#5D351C", "#E7C35B", "#9A1F40", "#243B6B"];
    const shirtColors = ["#1A936F", "#FF7A59", "#3D5AF1", "#F4B400", "#111827"];
    const bgPairs = [
        ["#A0E9FF", "#6C63FF"],
        ["#FFE29A", "#FF719A"],
        ["#C3F584", "#33B47A"],
        ["#FFD6A5", "#FD8A8A"],
        ["#B8F2E6", "#5E60CE"]
    ];
    const accessoryColors = ["#FFFFFF", "#1F2937", "#E63946", "#00B4D8"];

    const [bgTop, bgBottom] = bgPairs[Math.floor(rng() * bgPairs.length)];
    const skin = toColor(skinTones[Math.floor(rng() * skinTones.length)]);
    const hair = toColor(hairColors[Math.floor(rng() * hairColors.length)]);
    const shirt = toColor(shirtColors[Math.floor(rng() * shirtColors.length)]);
    const accessory = toColor(accessoryColors[Math.floor(rng() * accessoryColors.length)]);
    const blush = toColor("#F4A6B7");
    const eye = toColor("#111111");
    const mouth = toColor("#9B2226");

    drawBackground(canvas, toColor(bgTop), toColor(bgBottom));
    drawSparkles(canvas, rng);

    fillCircle(canvas, 256, 405, 112, blend(shirt, toColor("#FFFFFF"), 0.15));
    fillRect(canvas, 154, 324, 204, 146, shirt);
    fillEllipse(canvas, 256, 185, 22, 28, skin);
    fillCircle(canvas, 256, 180, 96, skin);

    const hairStyle = Math.floor(rng() * 3);

    if (hairStyle === 0) {
        fillEllipse(canvas, 256, 150, 105, 88, hair);
        fillRect(canvas, 170, 150, 172, 40, hair);
    } else if (hairStyle === 1) {
        fillEllipse(canvas, 256, 142, 112, 78, hair);
        fillEllipse(canvas, 192, 170, 26, 52, hair);
        fillEllipse(canvas, 320, 170, 26, 52, hair);
    } else {
        fillEllipse(canvas, 256, 148, 100, 72, hair);
        fillRect(canvas, 178, 138, 156, 26, hair);
    }

    fillCircle(canvas, 220, 185, 10, eye);
    fillCircle(canvas, 292, 185, 10, eye);
    fillCircle(canvas, 217, 182, 3, toColor("#FFFFFF"));
    fillCircle(canvas, 289, 182, 3, toColor("#FFFFFF"));
    fillEllipse(canvas, 256, 220, 12, 8, skin);
    fillEllipse(canvas, 256, 246, 26, 12, mouth);
    fillCircle(canvas, 190, 224, 14, blush);
    fillCircle(canvas, 322, 224, 14, blush);

    const accessoryStyle = Math.floor(rng() * 4);

    if (accessoryStyle === 0) {
        fillRect(canvas, 205, 172, 36, 24, accessory);
        fillRect(canvas, 271, 172, 36, 24, accessory);
        fillRect(canvas, 241, 180, 30, 6, accessory);
    } else if (accessoryStyle === 1) {
        fillEllipse(canvas, 256, 122, 92, 18, accessory);
        fillRect(canvas, 188, 120, 136, 26, accessory);
    } else if (accessoryStyle === 2) {
        fillRect(canvas, 200, 285, 112, 16, accessory);
        fillRect(canvas, 230, 265, 52, 24, accessory);
    } else {
        fillCircle(canvas, 164, 206, 16, accessory);
        fillCircle(canvas, 348, 206, 16, accessory);
    }
}

function crc32(buffer) {
    let crc = 0xffffffff;

    for (const byte of buffer) {
        crc ^= byte;

        for (let i = 0; i < 8; i += 1) {
            const mask = -(crc & 1);
            crc = (crc >>> 1) ^ (0xedb88320 & mask);
        }
    }

    return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(data.length, 0);

    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

    return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function encodePng(canvas) {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(canvas.width, 0);
    ihdr.writeUInt32BE(canvas.height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const raw = Buffer.alloc(canvas.height * (canvas.width * 4 + 1));

    for (let y = 0; y < canvas.height; y += 1) {
        const rowStart = y * (canvas.width * 4 + 1);
        raw[rowStart] = 0;
        canvas.pixels.copy(raw, rowStart + 1, y * canvas.width * 4, (y + 1) * canvas.width * 4);
    }

    const compressed = zlib.deflateSync(raw);

    return Buffer.concat([
        signature,
        createChunk("IHDR", ihdr),
        createChunk("IDAT", compressed),
        createChunk("IEND", Buffer.alloc(0))
    ]);
}

function main() {
    const count = Number(process.argv[2] || 10);
    const startTokenId = Number(process.argv[3] || 1);

    if (!Number.isInteger(count) || count < 1) {
        console.error("생성 개수는 1 이상의 정수여야 합니다.");
        process.exit(1);
    }

    if (!Number.isInteger(startTokenId) || startTokenId < 1) {
        console.error("시작 토큰 ID는 1 이상의 정수여야 합니다.");
        process.exit(1);
    }

    fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 0; i < count; i += 1) {
        const tokenId = startTokenId + i;
        const canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE, toColor("#FFFFFF"));

        drawCharacter(canvas, tokenId);

        const filePath = path.join(outputDir, `${tokenId}.png`);
        fs.writeFileSync(filePath, encodePng(canvas));
    }

    console.log(`캐릭터 PNG ${count}개 생성 완료`);
    console.log(`출력 폴더: ${outputDir}`);
    console.log(`토큰 ID 범위: ${startTokenId} ~ ${startTokenId + count - 1}`);
}

main();
