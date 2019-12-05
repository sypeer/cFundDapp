import Web3 from "web3";
import droveFundArtifact from "../../build/contracts/DroveFund.json";

var reader;

const App = {
  web3: null,
  account: null,
  instance: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = droveFundArtifact.networks[networkId];
      this.instance = new web3.eth.Contract(
        droveFundArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      if ($('#campaign-details').length > 0) {
        let campaignId = new URLSearchParams(window.location.search).get('id');
        this.renderCampaignDetails(campaignId);
      } if ($('#campaign-list').length > 0)  {
        this.renderCampaigns();
      };

      $('#pledge-now').submit(function(event) {
        $('#msg').hide();
        var pledge = $('#pledge-amount').val();
        var campaignId = $('#campaign-id').val();

        App.instance.methods.donate(campaignId).send({value: App.web3.utils.toWei(pledge.toString(), 'ether'), from: App.account, gas:4700000});
        console.log(App.web3.utils.toWei(pledge.toString(), 'ether'));

        $('#msg').show();
        $('#msg').html('Thank you for your pledge!');
        event.preventDefault();
      });

      $('#campaign-info').submit(function(event) {
        $('#msg').hide();
        var title = $('#campaign-title').val();
        var goal = $('#campaign-goal').val();
        var deadline = $('#campaign-deadline').val();

        App.instance.methods.createCampaign(title, goal).send({from: App.account, gas:4700000});
        console.log(goal);

        $('#msg').show();
        $('#msg').html('Campaign created!');
        event.preventDefault();
      });

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  renderCampaigns: async function() {
    const { campaignIndex } = this.instance.methods;
    var count = await campaignIndex().call();
    for(var i=1; i<=count; i++) {
      this.renderCampaign(i);
    };
  },

  renderCampaign: async function(campaign) {
    const { checkCampaign } = this.instance.methods;
    var camp = await checkCampaign(campaign).call();
    console.log(camp);

    let node = $('<div style="background-color: #ffffff; box-shadow: 8px 8px 6px -6px #999; margin-top:30px;"/>');
    node.addClass('col-sm-3 text-center col-margin-bottom-1 campaign');
    node.append("<div class='title'>" + "Campaign: " + camp[1] +"</div>");
    node.append("<div class='goal'>" + "Funding Goal: Ξ " + camp[2] + "</div>");
    node.append("<a href='campaign.html?id=" + camp[0] + "'>Details</a>");
    node.append("</div>");
    $("#campaign-list").append(node);
  },

  renderCampaignDetails: async function(campaignId) {
    const { checkCampaign } = this.instance.methods;
    var camp = await checkCampaign(campaignId).call();
    console.log(camp)

    $('#campaign-id').val(camp[0]);
    $('#campaign-title').html("Campaign: " + camp[1]);
    $('#campaign-goal').html("Funding Goal: Ξ " + camp[2]);
    $('#campaign-raised').html('Number of Funders: ' + camp[4]);

    if (camp[3] === App.account) {
      $('#pledge-now').hide();
    } else {
      $('#withdraw-funds').hide();
    }
  },

};

function displayPrice(amt) {
  return 'Ξ' + App.web3.utils.fromWei(amt.toString(), 'ether');
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
