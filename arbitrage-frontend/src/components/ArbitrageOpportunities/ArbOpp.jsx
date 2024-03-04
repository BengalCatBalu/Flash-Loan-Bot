import React, { useContext, useState, useEffect } from 'react';
import { Table } from 'antd';
import { usePairsData } from '../../pairsDataContext';

const ArbitrageOpportunities = () => {
    const { pairsData } = usePairsData();
    const [arbitrageOpportunities, setArbitrageOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pairsData.length) {
            setLoading(true);
            const opportunities = [];
            const tokenPrices = {};

            pairsData.forEach(pair => {
                const token = pair.stableIndex === 0 ? pair.pair.split('-')[1] : pair.pair.split('-')[0];
                const stablecoin = pair.stableIndex === 0 ? pair.pair.split('-')[0] : pair.pair.split('-')[1];
                const price = parseFloat(pair.stableIndex === 0 ? pair.priceToken1 : pair.priceToken0);
                const address = pair.address;
                tokenPrices[token] = tokenPrices[token] || {};
                tokenPrices[token][stablecoin] = {price: price, address: pair.address};
            });

            Object.keys(tokenPrices).forEach(token => {
                const prices = tokenPrices[token];
                const stablecoins = Object.keys(prices);
                if (stablecoins.length > 1) {
                    console.log(token, stablecoins);
                    for (let i = 0; i < stablecoins.length - 1; i++) {
                        for (let j = i + 1; j < stablecoins.length; j++) {
                            const priceDifference = Math.abs(prices[stablecoins[i]].price - prices[stablecoins[j]].price);
                            if (priceDifference > 0) {
                                opportunities.push({
                                    key: `${token}-${stablecoins[i]}-${stablecoins[j]}`,
                                    token,
                                    price1: `${prices[stablecoins[i]].price} ${stablecoins[i]}`,
                                    price2: `${prices[stablecoins[j]].price} ${stablecoins[j]}`,
                                    difference: `${priceDifference.toFixed(4)} $`,
                                    path: `${token}/${stablecoins[i]}  ->  ${token}/${stablecoins[j]}  ->  ${stablecoins[i]}/${stablecoins[j]}`,
                                });
                            }
                        }
                    }
                }
            });

            setArbitrageOpportunities(opportunities);
            setLoading(false);
        }
    }, [pairsData]);

    const columns = [
        {
            title: 'Token',
            dataIndex: 'token',
            key: 'token',
        },
        {
            title: 'Price 1',
            dataIndex: 'price1',
            key: 'price1',
        },
        {
            title: 'Price 2',
            dataIndex: 'price2',
            key: 'price2',
        },
        {
            title: 'Spread',
            dataIndex: 'difference',
            key: 'difference',
        },
        {
          title: 'Path',
          dataIndex: 'path',
          key: 'path'
        }
    ];

    return <Table columns={columns} dataSource={arbitrageOpportunities} loading={loading} pagination = {false}/>;
};

export default ArbitrageOpportunities;

