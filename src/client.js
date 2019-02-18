import ApolloClient from "apollo-boost";
import { typeDefs, resolvers } from './resolvers'

import React from "react";
import ReactDOM from "react-dom";
const gql = require("graphql-tag")
import { ApolloProvider, Query, ApolloConsumer, Mutation, graphql  } from "react-apollo";
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache();

const client = new ApolloClient({
  uri: `//localhost:9955/graphql`,
  cache,
  clientState: {
    typeDefs
  }
});


const putBidModifierConfigCampaigns = gql`
  mutation PutBidModifierConfigCampaigns($config_id: ID, $campaign_ids: [ID]) {
    putBidModifierConfigCampaigns(config_id: $config_id, campaign_ids: $campaign_ids) {
      id,
      config_id,
      campaign_id
    }
  }
`

const getBidModifierConfigs = gql`
{
  bidModifierConfigs {
    id,
    site_id,
    name,
    channel,
  }
}
`

const getBidModifierConfigCampaigns = gql`
{
  bidModifierConfigCampaigns {
    id,
    config_id,
    campaign_id,
  }
}
`

const getCampaigns = gql`
{
  campaigns {
    id,
    name,
    channel,
  }
}
`

const BidModifierConfigCampaign = (props) => (
  <div>
    {props.campaign.id}: {props.campaign.name} [{props.campaign.channel}]
    <input type="button" value="remove" onClick={() => props.onremove()}/>
  </div>
)


const bidModifierConfigCampaigns = (props) => {
  const makeunsub = (id) => () => {
    let updated = props.campaigns
      .filter(x => x.id != id)
      .map(x => x.id)

    props.mutate({
      variables: {config_id: props.config_id, campaign_ids: updated}
    })
  }

  return (
    <div>
      <ul>
        { props.campaigns.map(c =>
            <BidModifierConfigCampaign
              key={c.id}
              campaign={c}
              onremove={makeunsub(c.id)}
            />
          )}
      </ul>
    </div>
  )
}

const BidModifierConfigCampaigns = graphql(putBidModifierConfigCampaigns, {
  options: {
    update: (cache, { data: {putBidModifierConfigCampaigns} }) => {
      //let existing = cache.readQuery({query: getBidModifierConfigCampaigns})
      //console.log(existing, data)
      cache.writeQuery({
        query: getBidModifierConfigCampaigns,
        data: {bidModifierConfigCampaigns: putBidModifierConfigCampaigns}
      })
    },
  },

})(bidModifierConfigCampaigns)

const Campaigns = () => (
  <Query query={getBidModifierConfigs} >
  {({ loading, error, data: {bidModifierConfigs} }) => (

  <Query query={getCampaigns} >
  {({ loading: loadingCampaigns, errorCampaigns, data: {campaigns}}) => (

    <Query query={getBidModifierConfigCampaigns} >
      {({ loading: loading1, error: error1, data: {bidModifierConfigCampaigns}}) => {

        if (loading || loading1 || loadingCampaigns) return <p>Loading...</p>;
        if (error || error1 || errorCampaigns) return <p>Error :(</p>;

        const byid = {}
        campaigns.forEach(x => byid[x.id] = x)

        return bidModifierConfigs.map(x => (
          <div key={x.id}>
            <p> {x.id}: {x.name} </p>
            <ul>
              <BidModifierConfigCampaigns
                config_id={x.id}
                campaigns={bidModifierConfigCampaigns
                  .filter(cc => cc.config_id == x.id)
                  .map(cc => byid[cc.campaign_id])}
              />
            </ul>
          </div>
        ))
      }}
    </Query>
  )}
  </Query>
  )}
  </Query>
)

const App = () => (
    <ApolloProvider client={client}>
      <div>
        <Campaigns/>
      </div>
    </ApolloProvider>
);

ReactDOM.render(<App/>, document.getElementById("root"));
