import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProductPassport", function () {
  async function deployPassportFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ProductPassport = await ethers.getContractFactory("ProductPassport");
    const passport = await ProductPassport.deploy();
    return { passport, owner, otherAccount };
  }

  it("Should mint a new passport and assign it the correct data", async function () {
    const { passport, owner } = await deployPassportFixture();
    const productSku = "WM-12345";

    await passport.mintPassport(productSku);

    const tokenData = await passport.productData(0);

    expect(await passport.ownerOf(0)).to.equal(owner.address);
    expect(tokenData.productID).to.equal(productSku);
    expect(tokenData.status).to.equal("Returned - Pending Inspection");
  });

  it("Should allow the owner to update the status", async function () {
    const { passport } = await deployPassportFixture();
    await passport.mintPassport("WM-12345");

    const newStatus = "Like New";
    await passport.updateStatus(0, newStatus);

    const tokenData = await passport.productData(0);
    expect(tokenData.status).to.equal(newStatus);
  });
});