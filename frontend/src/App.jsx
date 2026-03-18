import { startTransition, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACTS, NFT_ABI, RPC_URL } from "./contracts";

async function loadMetadata(tokenUri) {
  const cacheBustedTokenUri = `${tokenUri}${tokenUri.includes("?") ? "&" : "?"}ts=${Date.now()}`;
  const response = await fetch(cacheBustedTokenUri, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`메타데이터를 불러오지 못했습니다: ${response.status}`);
  }

  return response.json();
}

async function loadContractView(contractConfig, provider) {
  const contract = new ethers.Contract(contractConfig.address, NFT_ABI, provider);
  const [name, symbol, totalSupplyRaw] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.totalSupply()
  ]);

  const totalSupply = Number(totalSupplyRaw);
  const tokenIds = Array.from({ length: totalSupply }, (_, index) => index + 1);
  const nftItems = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const tokenUri = await contract.tokenURI(tokenId);
      let metadata = null;
      let metadataError = null;

      try {
        metadata = await loadMetadata(tokenUri);
      } catch (error) {
        metadataError = error instanceof Error ? error.message : "알 수 없는 오류";
      }

      return {
        tokenId,
        tokenUri,
        metadata,
        metadataError
      };
    })
  );

  return {
    ...contractConfig,
    name,
    symbol,
    totalSupply,
    nftItems
  };
}

function ContractList({ contracts, activeContractId, onSelect }) {
  return (
    <aside className="contract-panel">
      <div className="panel-header">
        <p className="eyebrow">Contract Index</p>
        <h1>SimpleNFT DApp</h1>
        <p className="panel-copy">지갑 연결 없이 컨트랙트와 NFT 메타데이터를 읽는 뷰어입니다.</p>
      </div>

      <div className="contract-list">
        {contracts.map((contract) => (
          <button
            key={contract.id}
            type="button"
            className={`contract-card ${activeContractId === contract.id ? "is-active" : ""}`}
            onClick={() => onSelect(contract.id)}
          >
            <span className="contract-network">{contract.network}</span>
            <strong>Contract</strong>
            <span className="contract-address">
              {`${contract.address.slice(0, 8)}...${contract.address.slice(-6)}`}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function NftCard({ nft }) {
  const imageUrl = nft.metadata?.image
    ? `${nft.metadata.image}${nft.metadata.image.includes("?") ? "&" : "?"}ts=${nft.tokenId}`
    : "";

  return (
    <article className="nft-card">
      <div className="nft-media">
        {nft.metadata?.image ? (
          <img src={imageUrl} alt={nft.metadata.name || `NFT #${nft.tokenId}`} />
        ) : (
          <div className="nft-placeholder">No Image</div>
        )}
      </div>

      <div className="nft-body">
        <div className="nft-heading">
          <p className="nft-token">Token #{nft.tokenId}</p>
          <h3>{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
        </div>

        <p className="nft-description">
          {nft.metadata?.description || nft.metadataError || "메타데이터 설명이 없습니다."}
        </p>

        <div className="nft-links">
          <a href={nft.tokenUri} target="_blank" rel="noreferrer">
            metadata
          </a>
          {nft.metadata?.image ? (
            <a href={nft.metadata.image} target="_blank" rel="noreferrer">
              image
            </a>
          ) : null}
        </div>

        {Array.isArray(nft.metadata?.attributes) && nft.metadata.attributes.length > 0 ? (
          <div className="attribute-grid">
            {nft.metadata.attributes.map((attribute, index) => (
              <div key={`${attribute.trait_type}-${index}`} className="attribute-chip">
                <span>{attribute.trait_type}</span>
                <strong>{String(attribute.value)}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ContractDetail({ contract, loading, error }) {
  if (loading) {
    return (
      <section className="detail-panel state-panel">
        <p className="eyebrow">Loading</p>
        <h2>컨트랙트와 NFT를 불러오는 중입니다.</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detail-panel state-panel">
        <p className="eyebrow">Error</p>
        <h2>조회에 실패했습니다.</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (!contract) {
    return (
      <section className="detail-panel state-panel">
        <p className="eyebrow">Empty</p>
        <h2>선택된 컨트랙트가 없습니다.</h2>
      </section>
    );
  }

  return (
    <section className="detail-panel">
      <header className="hero-card">
        <div>
          <p className="eyebrow">{contract.network}</p>
          <h2>{contract.name}</h2>
          <p className="hero-copy">
            {contract.symbol} 컬렉션과 발행된 NFT를 읽기 전용으로 확인할 수 있습니다.
          </p>
        </div>

        <dl className="hero-stats">
          <div>
            <dt>Address</dt>
            <dd>{contract.address}</dd>
          </div>
          <div>
            <dt>Total Supply</dt>
            <dd>{contract.totalSupply}</dd>
          </div>
          <div>
            <dt>RPC</dt>
            <dd>{RPC_URL}</dd>
          </div>
        </dl>
      </header>

      <section className="nft-section">
        <div className="section-heading">
          <p className="eyebrow">NFT Gallery</p>
          <h3>Minted Tokens</h3>
        </div>

        {contract.nftItems.length === 0 ? (
          <div className="empty-gallery">아직 민팅된 NFT가 없습니다.</div>
        ) : (
          <div className="nft-grid">
            {contract.nftItems.map((nft) => (
              <NftCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default function App() {
  const [activeContractId, setActiveContractId] = useState(CONTRACTS[0]?.id ?? null);
  const [contractsById, setContractsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    async function run() {
      setLoading(true);
      setError("");

      try {
        await provider.getBlockNumber();
        const loadedContracts = await Promise.all(
          CONTRACTS.map((contractConfig) => loadContractView(contractConfig, provider))
        );

        if (isCancelled) {
          return;
        }

        startTransition(() => {
          setContractsById(
            Object.fromEntries(loadedContracts.map((contract) => [contract.id, contract]))
          );
          setLoading(false);
        });
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "컨트랙트 정보를 읽지 못했습니다.";

        startTransition(() => {
          setError(message);
          setLoading(false);
        });
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, []);

  const activeContract = activeContractId ? contractsById[activeContractId] : null;

  return (
    <main className="app-shell">
      <div className="backdrop backdrop-left" />
      <div className="backdrop backdrop-right" />

      <ContractList
        contracts={CONTRACTS}
        activeContractId={activeContractId}
        onSelect={setActiveContractId}
      />

      <ContractDetail contract={activeContract} loading={loading} error={error} />
    </main>
  );
}
