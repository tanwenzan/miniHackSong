const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let SimpleToken;
  let simpleToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // 获取合约工厂和测试账户
    SimpleToken = await ethers.getContractFactory("SimpleToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约
    simpleToken = await SimpleToken.deploy();
    await simpleToken.deployed();
  });

  describe("部署", function () {
    it("应该设置正确的代币名称和符号", async function () {
      expect(await simpleToken.name()).to.equal("SimpleToken");
      expect(await simpleToken.symbol()).to.equal("STK");
    });

    it("应该将所有代币分配给部署者", async function () {
      const totalSupply = await simpleToken.totalSupply();
      expect(await simpleToken.balanceOf(owner.address)).to.equal(totalSupply);
    });
  });

  describe("交易", function () {
    it("应该能够转账代币", async function () {
      // 转账100个代币给addr1
      await simpleToken.transfer(addr1.address, 100);
      const addr1Balance = await simpleToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);
    });

    it("应该在转账时更新余额", async function () {
      const initialOwnerBalance = await simpleToken.balanceOf(owner.address);

      // 转账100个代币给addr1
      await simpleToken.transfer(addr1.address, 100);

      // 转账50个代币从addr1到addr2
      await simpleToken.connect(addr1).transfer(addr2.address, 50);

      // 检查余额
      const finalOwnerBalance = await simpleToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(100));

      const addr1Balance = await simpleToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      const addr2Balance = await simpleToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("当发送者余额不足时应该失败", async function () {
      const initialOwnerBalance = await simpleToken.balanceOf(owner.address);

      // 尝试发送超过余额的代币
      await expect(
        simpleToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("余额不足");

      // 所有者余额应保持不变
      expect(await simpleToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});