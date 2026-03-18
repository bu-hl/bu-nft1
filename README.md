# 기본 NFT 컨트랙트

Simple ERC-721 NFT 컨트랙트입니다.

## 학습 목표

- ERC-721 표준 이해
- OpenZeppelin 라이브러리 사용법
- Hardhat 기본 사용법
- NFT 민팅 구현

## 컨트랙트 구조

- `SimpleNFT.sol`: 최소한의 ERC-721 구현
  - mint(): NFT 발행 (owner만 가능)
  - setBaseURI(): 메타데이터 URI 설정
  - totalSupply(): 발행된 총 NFT 수

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`를 복사한 뒤 필요한 값을 채웁니다.

```bash
cp .env.example .env
```

예시:

```bash
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
HOODI_RPC_URL=https://rpc.hoodi.ethpandaops.io
NFT_CONTRACT_ADDRESS=your_contract_address_here
NFT_BASE_URI=https://your-bucket.s3.region.amazonaws.com/metadata/
```

### 3. 컴파일

```bash
npm run compile
```

### 4. 로컬 배포 테스트

```bash
# 터미널 1: 로컬 노드 실행
npm run node

# 터미널 2: 배포
npm run deploy:localhost

# 민팅
npm run mint

# Base URI 설정
npm run set-uri
```

### 5. 세폴리아 배포

```bash
npm run deploy:sepolia
npm run mint:sepolia
npm run set-uri:sepolia
```

세폴리아 기본 체인 정보:

- Network Name: Sepolia
- Chain ID: 11155111
- Currency Symbol: ETH

### 6. Hoodi 배포

```bash
npm run deploy:hoodi
npm run mint:hoodi
npm run set-uri:hoodi
```

### 7. 지갑 생성

테스트용 지갑이 필요하면 아래 명령으로 새 지갑을 생성할 수 있습니다.

```bash
npm run wallet
```
