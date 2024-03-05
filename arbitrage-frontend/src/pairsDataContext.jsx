import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";

const GET_TOP_PAIRS = gql`
  {
    pairs(first: 500, orderBy: reserveUSD, orderDirection: desc) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      reserveUSD
      volumeUSD
      totalSupply
      reserve0
      reserve1
    }
  }
`;

const PairsDataContext = createContext();

export const usePairsData = () => useContext(PairsDataContext);

export const PairsDataProvider = ({ children }) => {
  const { loading, data } = useQuery(GET_TOP_PAIRS);
  const [pairsData, setPairsData] = useState([]);

  useEffect(() => {
    if (!loading && data && data.pairs) {
      const formattedData = data.pairs
        // .filter(
        //   (pair) =>
        //     ["USDC", "USDT", "DAI"].includes(pair.token0.symbol) ||
        //     ["USDC", "USDT", "DAI"].includes(pair.token1.symbol)
        // )
        .map((pair) => ({
          key: pair.id,
          token0symbol: pair.token0.symbol,
          token1symbol: pair.token1.symbol,
          nonStableSymbol: ["USDC", "USDT", "DAI"].includes(pair.token0.symbol)
            ? pair.token1.symbol
            : pair.token0.symbol,
          stableSymbol: ["USDC", "USDT", "DAI"].includes(pair.token0.symbol)
            ? pair.token0.symbol
            : pair.token1.symbol,
          pair: `${pair.token0.symbol}-${pair.token1.symbol}`,
          liquidity: `$${parseFloat(pair.reserveUSD).toLocaleString()}`,
          priceToken0: (pair.reserve1 / pair.reserve0).toFixed(6),
          priceToken1: (pair.reserve0 / pair.reserve1).toFixed(6),
          priceToken0String: `1 ${pair.token0.symbol} = ${(
                pair.reserve1 / pair.reserve0
              ).toFixed(6)} ${pair.token1.symbol}`,
          priceToken1String: `1 ${pair.token1.symbol} = ${(
                pair.reserve0 / pair.reserve1
              ).toFixed(6)} ${pair.token0.symbol}`,
          stablecoinPriceNum: ["USDC", "USDT", "DAI"].includes(
            pair.token0.symbol
          )
            ? (pair.reserve0 / pair.reserve1).toFixed(6)
            : (pair.reserve1 / pair.reserve0).toFixed(6),
          volume: parseFloat(pair.volumeUSD).toFixed(3),
          volumeText: `${parseFloat(pair.volumeUSD).toFixed(3)}$`,
          address: pair.id,
          stableIndex: ["USDC", "USDT", "DAI"].includes(pair.token0.symbol)
            ? 0
            : 1,
          tokenIndex: ["USDC", "USDT", "DAI"].includes(pair.token0.symbol)
            ? 1
            : 0,
        }));
      setPairsData(formattedData);
    }
  }, [loading, data]);

  return (
    <PairsDataContext.Provider value={{ pairsData, loading }}>
      {children}
    </PairsDataContext.Provider>
  );
};
