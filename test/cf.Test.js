// Test file for Drove Fund Solidity Contract

// Import Artifact
var DroveFund = artifacts.require('./DroveFund.sol');

contract('DroveFund', function(accounts) {

  // Assign accounts and variables
  const campaigner = accounts[1];
  const pledger = accounts[2];
  const goal = web3.utils.toBN(20);
  const donation = web3.utils.toBN(5);

  // Initiate instance
  beforeEach(async function() {
    instance = await DroveFund.new();
  });

  // Test campaign creation
  it('Checking campaign creation', async function() {
    await instance.createCampaign('Test Campaign', goal, {from: campaigner});
    const campaign = await instance.checkCampaign(1);
    assert.equal(campaign[2], 20, 'Campaign not created, check campaign creation method');
  });

  // Test campaign detial check
  it('Checking campaign details', async function() {
    await instance.createCampaign('Test Campaign', goal, {from: campaigner});
    const campaign = await instance.checkCampaign(1);
    assert.equal(campaign[0], 1, 'Campaign detials incorrect, check campaign creation method');
  });

  // Test donation functionality
  it('Checking donation', async function() {
    await instance.createCampaign('Test Campaign', goal, {from: campaigner});
    await instance.donate(1, {from: pledger, value: donation});
    await instance.donate(1, {from: pledger, value: donation});
    const pledge = await instance.checkDonations(1);
    assert.equal(pledge, 10, 'Donation not made, check donate method');
  });

  // Test fund collection upon successful goal raised
  it('Checking successful funding withdrawal', async function() {
    await instance.createCampaign('Test Campaign', goal, {from: campaigner});
    await instance.donate(1, {from: pledger, value: (donation * 4)});
    await instance.collectFunds(1, {from: campaigner});
    const collection = await instance.checkDonations(1);
    assert.equal(collection, 0, 'Funding error');
  });

});
