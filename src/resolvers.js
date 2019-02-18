const gql = require("graphql-tag")

const store = {
  campaigns: [
    { id: 11231241, site_id: 55, name: "Campaign 1", bid_modifiers_disabled: false, channel: "shopping", },
    { id: 21212342, site_id: 55, name: "Campaign 2", bid_modifiers_disabled: false, channel: "shopping", },
    { id: 31212342, site_id: 55, name: "Campaign 3", bid_modifiers_disabled: false, channel: "shopping", },
    { id: 41212342, site_id: 55, name: "Campaign 4", bid_modifiers_disabled: false, channel: "shopping", },
    { id: 51212342, site_id: 55, name: "Campaign 5", bid_modifiers_disabled: false, channel: "shopping", },
    { id: 61212342, site_id: 55, name: "Campaign 6", bid_modifiers_disabled: false, channel: "search", },
    { id: 71212342, site_id: 55, name: "Campaign 7", bid_modifiers_disabled: false, channel: "search", },
  ],
  bidModifierConfigs: [
    { id: 2, channel: "shopping", name: "shopping config 1", site_id: 55, },
    { id: 3, channel: "shopping", name: "shopping config 3", site_id: 55, },
    { id: 4, channel: "search", name: "search config", site_id: 55, },
  ],
  bidModifierConfigCampaigns: [
    { config_id: 2, campaign_id: 11231241, site_id: 55, },
    { config_id: 2, campaign_id: 21212342, site_id: 55, },
    { config_id: 3, campaign_id: 41212342, site_id: 55, },
    { config_id: 3, campaign_id: 51212342, site_id: 55, },
    { config_id: 3, campaign_id: 31212342, site_id: 55, },
    { config_id: 4, campaign_id: 71212342, site_id: 55, },
    { config_id: 4, campaign_id: 61212342, site_id: 55, },
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
  }

  type BidModifierConfigCampaign {
    id: ID
    config_id: ID
    campaign_id: ID
  }

  type Query {
    campaigns(site_id: Int): [Campaign]
    bidModifierConfigs(site_id: Int): [BidModifierConfig]
    bidModifierConfigCampaigns(site_id: Int): [BidModifierConfigCampaign]
  }

  type Mutation {
    putBidModifierConfigCampaigns(config_id: ID, campaign_ids: [ID]): [BidModifierConfigCampaign]
  }
`

const resolvers = {
  Query: {
    campaigns: (_, {site_id}) => {
      if (site_id) { return store.campaigns.filter(x => x.site_id == site_id) }
      return store.campaigns
    },
    bidModifierConfigs: (_, {site_id, config_id}) => {
      let ret = store.bidModifierConfigs
      if (site_id) { ret = ret.filter(x => x.site_id == site_id) }
      if (config_id) { ret = ret.filter(x => x.id == config_id) }

      return ret
    },
    bidModifierConfigCampaigns: (_, {site_id}) => {
      let ret = store.bidModifierConfigCampaigns
        .map(({config_id, campaign_id}) => ({config_id, campaign_id, id: config_id + '_' + campaign_id}))
      console.log(ret)
      return ret
    },
  },
  Mutation: {
    putBidModifierConfigCampaigns: (_, {config_id, campaign_ids}) => {
      console.log(config_id, campaign_ids)
      const rest = store.bidModifierConfigCampaigns.filter(x => x.config_id != config_id)
      const updated = campaign_ids.map(campaign_id => ({config_id, campaign_id}))
      const ret = rest.concat(updated)
      store.bidModifierConfigCampaigns = ret
      return resolvers.Query.bidModifierConfigCampaigns({},{})
    },
  }
};

module.exports = {
  resolvers,
  typeDefs,
}
