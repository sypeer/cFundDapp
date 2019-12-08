pragma solidity >=0.4.21 <0.6.0;

contract DroveFund {

  // State variables
  uint public campaignIndex;
  mapping (uint => Campaign) userCampaigns;

  // Structs
  struct Funder {
    address payable funder;
    uint amount;
  }

  struct Campaign {
    uint id;
    address payable owner;
    string title;
    uint goal;
    uint collected;
    uint startTime;
    uint deadline;
    uint funders;
    mapping (uint => Funder) campaignFunders;
  }

  // Events
  event CampaignCreationLog(address creator, string title, uint goal);
  event DonationLog(address donator, uint donation);
  event CollectionLog(address collector, uint amount);
  event RefundLog(uint campignId, uint amount);

  constructor() public {
    campaignIndex = 0;
  }

  // Campaign creation
  function createCampaign(string memory _title, uint _goal) public payable returns(bool){
    campaignIndex += 1;
  //  uint deadline = now + (_daysTillDeadline * 1 days);
    uint deadline = now + (90 * 1 days);
    Campaign memory campaign = Campaign(campaignIndex, msg.sender, _title, _goal, 0, now, deadline, 0);
    userCampaigns[campaignIndex] = campaign;
    emit CampaignCreationLog(campaign.owner, campaign.title, campaign.goal);
    return(true);
  }

  // Campaign donation
  function donate(uint _id) public payable returns(bool){
    Campaign storage campaign = userCampaigns[_id];
    require(msg.sender != campaign.owner);
    require(campaign.deadline > now);
    campaign.funders = campaign.funders + 1;
    campaign.collected = campaign.collected +  msg.value;
    campaign.campaignFunders[campaign.funders] = Funder(msg.sender, msg.value);
    userCampaigns[_id] = campaign;
    emit DonationLog(msg.sender, msg.value);
    return(true);
  }

  // Fund collection after reaching goal
  function collectFunds(uint _id) public returns(bool){
    Campaign memory campaign = userCampaigns[_id];
    require(msg.sender == campaign.owner);
    require(campaign.goal <= campaign.collected);
    //require(now > campaign.deadline);
    msg.sender.transfer(campaign.collected);
    emit CollectionLog(msg.sender, campaign.collected);
    campaign.collected = 0;
    userCampaigns[_id] = campaign;
    return(true);
  }

  // Donation refund if goal not reached before deadline
  function refundDonations(uint _id) public returns(bool){
    Campaign storage campaign = userCampaigns[_id];
    require(now > campaign.deadline);
    require(campaign.goal > campaign.collected);
    uint i=0;
    for(i=0; i<=campaign.funders; i++) {
      Funder memory funder = campaign.campaignFunders[i];
      funder.funder.transfer(funder.amount);
    }
    emit RefundLog(campaign.id, campaign.collected);
    return(true);
  }

  // Check campaign details
  function checkCampaign(uint _id) public view returns (uint, string memory, uint, address, uint) {
    Campaign memory campaign = userCampaigns[_id];
    return(campaign.id, campaign.title, campaign.goal, campaign.owner, campaign.collected);
  }

  // Return funds collected till present
  function checkDonations(uint _id) public view returns (uint) {
    Campaign storage campaign = userCampaigns[_id];
    return(campaign.collected);
  }

  // Return campaign start time and deadline
  function currentTime(uint _id) public view returns(uint, uint) {
    Campaign memory campaign = userCampaigns[_id];
    return(campaign.startTime, campaign.deadline);
  }
}
