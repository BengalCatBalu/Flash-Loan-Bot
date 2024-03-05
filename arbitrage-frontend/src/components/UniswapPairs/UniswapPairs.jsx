import React, { useState } from "react";
import { Table, Input, Button, Space, message } from "antd";
import { SearchOutlined, CopyOutlined } from "@ant-design/icons";
import { usePairsData } from "../../pairsDataContext";
import "./style.css";

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success("Address copied to clipboard!");
  });
};

const columns = [
  {
    title: "Pair",
    dataIndex: "pair",
    key: "pair",
  },
  {
    title: "Liquidity",
    dataIndex: "liquidity",
    key: "liquidity",
    sorter: (a, b) => a.liquidity - b.liquidity,
  },
  {
    title: "Price 1",
    dataIndex: "priceToken0String",
    key: "priceToken0String",
  },
  {
    title: "Price 2",
    dataIndex: "priceToken1String",
    key: "priceToken1String",
  },
  {
    title: "Volume",
    dataIndex: "volumeText",
    key: "volumeText",
    sorter: (a, b) => a.volume - b.volume,
    defaultSortOrder: "descend",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    render: (text) => (
      <Button
        icon={<CopyOutlined />}
        onClick={() => copyToClipboard(text)}
        style={{ border: "none", padding: 0 }}
      >
        {text}
      </Button>
    ),
  },
];

const stablecoins = ['USDC', 'USDT', 'DAI'];

export const UniswapPairs = () => {
  const { pairsData, loading } = usePairsData(); // Используйте данные из контекста
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    const filteredData = pairsData.filter((data) =>
      data.pair.toLowerCase().includes(searchText.toLowerCase())
    );

    return filteredData;
  };

  const pagination = {
    pageSize: 10,
    hideOnSinglePage: true,
    showSizeChanger: false,
  };

  return (
    <div className="table-container">
      <Space style={{ marginBottom: "0.5vh" }}>
        <Input
          placeholder="Search pair..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "10vw" }}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          icon={<SearchOutlined />}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={!searchText ? pairsData : handleSearch()}
        loading={loading}
        pagination={pagination}
        className="centered-pagination"
      />
    </div>
  );
};
