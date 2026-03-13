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

### 2. 컴파일

```bash
npm run compile
```

### 3. 로컬 배포 테스트

```bash
# 터미널 1: 로컬 노드 실행
npm run node

# 터미널 2: 배포
npm run deploy:localhost
```

### 4. 테스트넷 배포

```bash
# .env 파일 생성 후 PRIVATE_KEY 설정
cp .env.example .env

npm run deploy:hoodi
```
