// 智能合约部署脚本
const hre = require("hardhat");

async function main() {
  console.log("开始部署SimpleToken合约...");

  // 获取合约工厂
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  
  // 部署合约
  const simpleToken = await SimpleToken.deploy();
  await simpleToken.deployed();

  console.log("SimpleToken合约已部署到地址:", simpleToken.address);

  // 将合约地址保存到前端配置中，以便前端可以访问
  saveContractAddress(simpleToken.address);
}

function saveContractAddress(address) {
  const fs = require("fs");
  const path = require("path");
  
  // 创建合约地址配置文件
  const contractsDir = path.join(__dirname, "../..", "frontend", "src", "contracts");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // 保存合约地址到前端配置文件
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ SimpleToken: address }, null, 2)
  );

  console.log("合约地址已保存到前端配置");
}

// 执行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署过程中出错:", error);
    process.exit(1);
  });