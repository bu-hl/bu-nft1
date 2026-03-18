# 기본 NFT 컨트랙트

Simple ERC-721 NFT 컨트랙트입니다. 메타데이터 JSON과 PNG 이미지를 생성해서 S3에 올리고, 컨트랙트 `baseURI`까지 연결하는 흐름을 포함합니다.

## 주요 파일

- `contracts/SimpleNFT.sol`: ERC-721 컨트랙트
- `scripts/generateMetadata.js`: 메타데이터 JSON 생성
- `scripts/generateCharacterImages.js`: 캐릭터 PNG 생성
- `scripts/uploadToS3.js`: S3 업로드
- `scripts/setBaseURI.js`: 컨트랙트 Base URI 설정

## 1. 의존성 설치

```bash
npm install
```

프론트엔드도 사용할 경우:

```bash
cd frontend
cp .env.sample .env
npm install
```

## 2. 환경변수 설정

`.env.example`를 복사한 뒤 값을 채웁니다.

```bash
cp .env.example .env
```

예시:

```bash
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
HOODI_RPC_URL=https://rpc.hoodi.ethpandaops.io

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=your-bucket-name

NFT_CONTRACT_ADDRESS=your_contract_address_here
NFT_BASE_URI=https://your-bucket.s3.ap-northeast-2.amazonaws.com/metadata/
NFT_IMAGE_BASE_URI=https://your-bucket.s3.ap-northeast-2.amazonaws.com/images
```

참고:

- `NFT_BASE_URI` 는 컨트랙트의 `tokenURI` 베이스 주소입니다.
- `NFT_IMAGE_BASE_URI` 는 메타데이터 JSON 내부의 `image` 필드에 들어갑니다.
- 일반 IAM Access Key를 쓰는 경우 `AWS_SESSION_TOKEN` 은 필요 없습니다.

## 3. 컴파일

```bash
npm run compile
```

## 4. 로컬 테스트

```bash
# 터미널 1
npm run node

# 터미널 2
npm run deploy:localhost
npm run mint
npm run set-uri
```

## 5. 배포

Sepolia:

```bash
npm run deploy:sepolia
npm run mint:sepolia
npm run set-uri:sepolia
```

Hoodi:

```bash
npm run deploy:hoodi
npm run mint:hoodi
npm run set-uri:hoodi
```

`NFT_CONTRACT_ADDRESS` 는 실제 배포한 네트워크의 주소로 맞춰야 합니다.

## 6. 지갑 생성

```bash
npm run wallet
```

## 7. 캐릭터 이미지 생성

토큰 ID를 시드로 사용해서 간단한 캐릭터 PNG를 생성합니다.

```bash
# 기본: 1번부터 10개 생성
npm run images

# 1번부터 20개 생성
node scripts/generateCharacterImages.js 20

# 101번부터 50개 생성
node scripts/generateCharacterImages.js 50 101
```

생성 결과:

- `images/generated/1.png`
- `images/generated/2.png`

## 8. 메타데이터 생성

`metadata/template.json`의 `TOKEN_ID`, `NFT_IMAGE_BASE_URI` 같은 플레이스홀더를 `.env` 값으로 치환합니다.

```bash
# 기본: 1번부터 10개 생성
npm run metadata

# 1번부터 20개 생성
node scripts/generateMetadata.js 20

# 101번부터 50개 생성
node scripts/generateMetadata.js 50 101
```

생성 결과:

- `metadata/generated/1`
- `metadata/generated/2`

## 9. S3 업로드

이미지 업로드:

```bash
npm run upload:images
```

메타데이터 업로드:

```bash
npm run upload:metadata
```

임의 폴더 업로드:

```bash
node scripts/uploadToS3.js metadata/generated metadata
node scripts/uploadToS3.js images/generated images
```

예:

- `images/generated/1.png` -> `s3://your-bucket/images/1.png`
- `metadata/generated/1` -> `s3://your-bucket/metadata/1`

## 10. S3 공개 설정

브라우저와 Etherscan에서 메타데이터/이미지를 읽으려면 S3 공개 읽기 설정이 필요합니다.

1. `S3 > 버킷 > Permissions > Block public access` 에서 퍼블릭 차단을 해제합니다.
2. `S3 > 버킷 > Permissions > Bucket policy` 에 아래 정책을 추가합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadMetadata",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/metadata/*"
    },
    {
      "Sid": "PublicReadImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/images/*"
    }
  ]
}
```

확인 예시:

- `https://your-bucket.s3.ap-northeast-2.amazonaws.com/metadata/1`
- `https://your-bucket.s3.ap-northeast-2.amazonaws.com/images/1.png`

## 11. 권장 실행 순서

```bash
npm run images
npm run metadata
npm run upload:images
npm run upload:metadata
npm run set-uri:hoodi
```

그 다음 NFT를 민팅하면 `tokenURI(tokenId)` 가 S3 메타데이터를 가리키게 됩니다.

## 12. Hoodi / Etherscan 확인

Hoodi 컨트랙트 주소 예시:

```text
https://hoodi.etherscan.io/address/<컨트랙트주소>
```

NFT 페이지 예시:

```text
https://hoodi.etherscan.io/nft/<컨트랙트주소>/1
```

Etherscan 반영이 늦을 수 있으므로, 먼저 아래 두 URL이 직접 열리는지 확인하는 것이 가장 확실합니다.

- `https://your-bucket.s3.ap-northeast-2.amazonaws.com/metadata/1`
- `https://your-bucket.s3.ap-northeast-2.amazonaws.com/images/1.png`

## 13. React DApp 실행

프론트엔드 환경변수는 [`frontend/.env.sample`](/home/ubuntu/workspace/bu-nft1/frontend/.env.sample) 을 복사해서 사용합니다.

```bash
cd frontend
cp .env.sample .env
npm install
npm run dev
```

사용하는 값:

- `VITE_RPC_URL`: 읽기 전용 RPC URL
- `VITE_CONTRACT_NETWORK`: 프론트에 표시할 네트워크 이름
- `VITE_CONTRACT_ADDRESS`: 프론트가 조회할 컨트랙트 주소
