import fetch from 'node-fetch';

const UNISWAP_V2_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';

export async function getUniswapPairData(token0Address, token1Address) {
    const query = `
    {
      pairs(where: {token0: "${token0Address}", token1: "${token1Address}"}) {
        id
        volumeUSD
        reserve0
        reserve1
        totalSupply
        reserveUSD
        token0 {
          id
          symbol
          name
        }
        token1 {
          id
          symbol
          name
        }
      }
    }
    `;

    try {
        const response = await fetch(UNISWAP_V2_SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        console.log(data);
        if (data && data.data && data.data.pairs.length > 0) {
            const pair = data.data.pairs[0];
            const priceOfToken0InTermsOfToken1 = pair.reserve1 / pair.reserve0;
            const priceOfToken1InTermsOfToken0 = pair.reserve0 / pair.reserve1;

            return {
                pairId: pair.id,
                volumeUSD: pair.volumeUSD,
                reserve0: pair.reserve0,
                reserve1: pair.reserve1,
                totalSupply: pair.totalSupply,
                reserveUSD: pair.reserveUSD,
                priceOfToken0InTermsOfToken1: priceOfToken0InTermsOfToken1,
                priceOfToken1InTermsOfToken0: priceOfToken1InTermsOfToken0,
                token0: {
                    id: pair.token0.id,
                    symbol: pair.token0.symbol,
                    name: pair.token0.name
                },
                token1: {
                    id: pair.token1.id,
                    symbol: pair.token1.symbol,
                    name: pair.token1.name
                }
            };
        } else {
            console.log('Pair not found or no data available');
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


