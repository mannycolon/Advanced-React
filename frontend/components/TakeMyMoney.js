import React, { Component } from 'react'
import PropTypes from 'prop-types'
import StripeCheckout from 'react-stripe-checkout'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import NProgress from 'nprogress'
import gql from 'graphql-tag'
import calcTotalPrice from '../lib/calcTotalPrice'
import Error from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'


const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
}

class TakeMyMoney extends Component {
  onToken = (res, createOrder) => {
    console.log('On Token called')
    // Manually call the mutation once we have the stripe token
    createOrder({
      variables: {
        token: res.id
      }
    })
    .catch(err => alert(err.message))
  }

  render() {
    return (
      <User>
        {({ data: { me }}) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {(createOrder) => (
              <StripeCheckout
                name="sick-fits"
                description={`Order of ${totalItems(me.cart)} items!`}
                amount={calcTotalPrice(me.cart)}
                image={me.cart[0].item && me.cart[0].item.image}
                stripeKey="pk_test_eTRToAUBCiC7J99ApzexND2D00vhtA9K6j"
                currency="USD"
                email={me.email}
                token={res => this.onToken(res, createOrder)}
              >
                {this.props.children}
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    )
  }
}

export default TakeMyMoney
