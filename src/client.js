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

const unsubCampaign = gql`
  mutation UnsubCampaign($config_id: ID, $campaign_id: ID) {
    unsubCampaign(config_id: $config_id, campaign_id: $campaign_id) {
      id,
      channel,
      name,
      site_id,
      campaigns {
        id,
        name,
      }
    }
  }
`;

const getBidModifierConfigs = gql`
{
  bidModifierConfigs {
    id,
    site_id,
    name,
    channel,
    campaigns {
      id,
      name,
    }
  }
}
`
const BidModifierConfigCampaign = (props) => (
  <div>
    {props.campaign.id}: {props.campaign.name}
    <input type="button" value="remove" onClick={() => props.mutate({
      variables: {campaign_id: props.campaign.id, config_id: props.configId},
    })}/>
  </div>
)

//const RemovableBidModifierConfigCampaign = graphql(unsubCampaign, {
//  props: ({ ownProps, mutate }) => ({
//
//  })
//})

const RemovableBidModifierConfigCampaign = graphql(unsubCampaign, {
  options: {
    update: (proxy, { data: {unsubCampaign} }) => {
      const data = proxy.readQuery({query: getBidModifierConfigs})
      console.log(data)
      let updated = data.bidModifierConfigs.filter(x => x.config_id == unsubCampaign.config_id)
      console.log(updated)
      updated.forEach(x => x.campaigns = unsubCampaign.campaigns)
      proxy.writeQuery({query: getBidModifierConfigs, data})
    },
  },
})(BidModifierConfigCampaign)

const Campaigns = () => (
  <Query
    query={getBidModifierConfigs}
  >
  {({ loading, error, data }) => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return data.bidModifierConfigs.map(x => (
      <div key={x.id}>
        <p> {x.id}: {x.name} </p>
        <ul>
        { x.campaigns.map(camp =>
            <RemovableBidModifierConfigCampaign key={camp.id} campaign={camp} configId={x.id}/>
          )}
        </ul>
      </div>
    ))
  }}
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
