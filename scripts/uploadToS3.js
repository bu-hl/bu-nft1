require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".json") return "application/json";
    if (ext === ".png") return "image/png";
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".gif") return "image/gif";
    if (ext === ".webp") return "image/webp";
    if (ext === ".svg") return "image/svg+xml";

    return "application/octet-stream";
}

function walkFiles(targetDir) {
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(targetDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...walkFiles(fullPath));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
}

async function main() {
    const localDirArg = process.argv[2] || "metadata/generated";
    const prefixArg = process.argv[3] || "metadata";
    const localDir = path.resolve(__dirname, "..", localDirArg);
    const prefix = prefixArg.replace(/^\/+|\/+$/g, "");
    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucket || !region) {
        console.error("AWS 환경변수가 부족합니다.");
        console.error("필수: AWS_REGION, S3_BUCKET_NAME");
        process.exit(1);
    }

    if (!fs.existsSync(localDir) || !fs.statSync(localDir).isDirectory()) {
        console.error(`업로드할 폴더를 찾을 수 없습니다: ${localDir}`);
        process.exit(1);
    }

    const files = walkFiles(localDir);

    if (files.length === 0) {
        console.error(`업로드할 파일이 없습니다: ${localDir}`);
        process.exit(1);
    }

    const client = new S3Client({ region });

    for (const filePath of files) {
        const relativePath = path.relative(localDir, filePath).split(path.sep).join("/");
        const key = prefix ? `${prefix}/${relativePath}` : relativePath;

        await client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: fs.readFileSync(filePath),
                ContentType: getMimeType(filePath)
            })
        );

        console.log(`업로드 완료: s3://${bucket}/${key}`);
    }

    console.log(`총 ${files.length}개 파일 업로드 완료`);
}

main().catch((error) => {
    console.error("업로드에 실패했습니다.");
    console.error(error.message);
    process.exit(1);
});
