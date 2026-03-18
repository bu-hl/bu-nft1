require("dotenv").config();
const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "..", "metadata", "template.json");
const outputDir = path.join(__dirname, "..", "metadata", "generated");

function getOptionalEnv(name) {
    const value = process.env[name];

    if (!value) {
        return undefined;
    }

    return value.replace(/\/+$/, "");
}

function replacePlaceholders(value, replacements) {
    if (typeof value === "string") {
        return Object.entries(replacements).reduce(
            (result, [placeholder, replacement]) => result.replaceAll(placeholder, replacement),
            value
        );
    }

    if (Array.isArray(value)) {
        return value.map((item) => replacePlaceholders(item, replacements));
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, replacePlaceholders(item, replacements)])
        );
    }

    return value;
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

    const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
    const imageBaseUri = getOptionalEnv("NFT_IMAGE_BASE_URI");

    fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 0; i < count; i += 1) {
        const tokenId = startTokenId + i;
        const metadata = replacePlaceholders(template, {
            TOKEN_ID: String(tokenId),
            NFT_BASE_URI: getOptionalEnv("NFT_BASE_URI") || "NFT_BASE_URI",
            NFT_IMAGE_BASE_URI: imageBaseUri || "NFT_IMAGE_BASE_URI"
        });
        const filename = path.join(outputDir, String(tokenId));

        fs.writeFileSync(filename, `${JSON.stringify(metadata, null, 2)}\n`);
    }

    console.log(`메타데이터 ${count}개 생성 완료`);
    console.log(`출력 폴더: ${outputDir}`);
    console.log(`토큰 ID 범위: ${startTokenId} ~ ${startTokenId + count - 1}`);

    if (!imageBaseUri) {
        console.warn("주의: NFT_IMAGE_BASE_URI가 없어 image 필드에 플레이스홀더가 유지됩니다.");
    }
}

main();
