pragma solidity >=0.4.21 <0.6.0;

contract DroveFund {

  uint public campaignIndex;

  mapping (uint => Campaign) userCampaigns;

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

  constructor() public {
    campaignIndex = 0;
  }

  function createCampaign(string memory _title, uint _goal) public {
    campaignIndex += 1;
  //  uint deadline = now + (_daysTillDeadline * 1 days);
    uint deadline = now + (90 * 1 days);
    Campaign memory campaign = Campaign(campaignIndex, msg.sender, _title, _goal, 0, now, deadline, 0);
    userCampaigns[campaignIndex] = campaign;
  }

  function donate(uint _id) public payable{
    Campaign storage campaign = userCampaigns[_id];
    //require(msg.sender != campaign.owner);
    require(campaign.deadline > now);
    campaign.funders = campaign.funders + 1;
    campaign.collected = campaign.collected +  msg.value;
    campaign.campaignFunders[campaign.funders] = Funder(msg.sender, msg.value);

    userCampaigns[_id] = campaign;
  }

  function collectFunds(uint _id) public {
    Campaign memory campaign = userCampaigns[_id];
    require(msg.sender == campaign.owner);
    require(campaign.goal <= campaign.collected);
    require(now > campaign.deadline);
    msg.sender.transfer(campaign.collected);
  }

  function refundDonations(uint _id) public {
    Campaign storage campaign = userCampaigns[_id];
    require(now > campaign.deadline);
    require(campaign.goal > campaign.collected);
    uint i=0;
    for(i=0; i<=campaign.funders; i++) {
      Funder memory funder = campaign.campaignFunders[i];
      funder.funder.transfer(funder.amount);
    }
  }

  function checkCampaign(uint _id) public view returns (uint, string memory, uint, address, uint) {
    Campaign memory campaign = userCampaigns[_id];
    return(campaign.id, campaign.title, campaign.goal, campaign.owner, campaign.collected);
  }

  function checkDonations(uint _id) public view returns (uint) {
    Campaign storage campaign = userCampaigns[_id];
    Funder memory funder = campaign.campaignFunders[campaign.funders];
    return(campaign.collected);
  }

  function currentTime(uint _id) public view returns(uint, uint) {
    Campaign memory campaign = userCampaigns[_id];
    return(campaign.startTime, campaign.deadline);
  }
}
