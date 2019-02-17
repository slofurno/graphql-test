const gql = require("graphql-tag")

const store = {
  campaigns: [
    {
      id: 1,
      site_id: 55,
      name: "Campaign 1",
      bid_modifiers_disabled: false,
      channel: "shopping",
    },
    {
      id: 2,
      site_id: 55,
      name: "Campaign 2",
      bid_modifiers_disabled: false,
      channel: "shopping",
    },
  ],
  bidModifierConfigs: [
    {
      id: 2,
      channel: "shopping",
      name: "shopping config 1",
      site_id: 55,
    }
  ],
  bidModifierConfigCampaigns: [
    {
      config_id: 2,
      campaign_id: 1,
      site_id: 55,
    },
    {
      config_id: 2,
      campaign_id: 2,
      site_id: 55,
    },
  ],
}

const typeDefs = gql`
  type Campaign {
    id: ID
    site_id: Int!
    name: String
    bid_modifiers_disabled: Boolean
    channel: String!
  }

  type BidModifierConfig {
    id: ID
    channel: String!
    name: String
    site_id: Int!
    campaigns: [Campaign]
  }

  type BidModifierConfigCampaign {
    config_id: ID
    campaign_id: ID
  }

  type Query {
    campaigns(site_id: Int): [Campaign]
    bidModifierConfigs(site_id: Int): [BidModifierConfig]
    bidModifierConfigCampaigns(site_id: Int): [ID]
    hello: String
  }

  type Mutation {
    unsubCampaign(config_id: ID, campaign_id: ID): BidModifierConfig
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type UpdateBidModifierConfigCampaigns implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    BidModifierConfigCampaigns: BidModifierConfig
  }
`

const resolvers = {
  Query: {
    hello: () => 'world',
    campaigns: (_, {site_id}) => {
      if (site_id) { return store.campaigns.filter(x => x.site_id == site_id) }
      return store.campaigns
    },
    bidModifierConfigs: (_, {site_id, config_id}) => {
      let ret = store.bidModifierConfigs
      if (site_id) { ret = ret.filter(x => x.site_id == site_id) }
      if (config_id) { ret = ret.filter(x => x.id == config_id) }

      ret = ret.map(x => {
        let campaigns = store.bidModifierConfigCampaigns
          .filter(cc => cc.config_id == x.id)
          .map(cc => store.campaigns.filter(camp => camp.id == cc.campaign_id)[0])
        return Object.assign({}, x, {campaigns})
      })

      return ret
    },
    bidModifierConfigCampaigns: (_, {site_id}) => store.bidModifierConfigCampaigns.filter(x => x.site_id == site_id).map(x => x.campaign_id),
  },
  Mutation: {
    unsubCampaign: (_, {config_id, campaign_id}) => {
      console.log("mutation:", config_id, campaign_id)
      store.bidModifierConfigCampaigns = store.bidModifierConfigCampaigns.filter(x => x.config_id != config_id || x.campaign_id != campaign_id)
      let updated = resolvers.Query.bidModifierConfigs(false, {config_id})
      return updated[0]
      //return {
      //  success: true,
      //  bidModifierConfigCampaigns: store.bidModifierConfigCampaigns,
      //}
    },
  }
};

module.exports = {
  resolvers,
  typeDefs,
}
