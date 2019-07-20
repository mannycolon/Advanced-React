import { mount } from 'enzyme'
import wait from 'waait'
import toJSON from 'enzyme-to-json'
import { MockedProvider } from 'react-apollo/test-utils'
import { ApolloConsumer } from 'react-apollo'
import RemoveFromCart, { REMOVE_FROM_CART_MUTATION } from '../components/RemoveFromCart'
import { CURRENT_USER_QUERY } from '../components/User'
import { fakeUser, fakeCartItem } from '../lib/testUtils'

global.alert = console.log

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem({ id: 'abc123' })]
        }
      }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'abc123' } },
    result: {
      data: {
        removeFromCart: {
          __typename: 'CartItem',
          id: 'abc123'
        }
      }
    }
  }
]

describe('<RemoveFromCart/>', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount (
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="abc123"/>
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(toJSON(wrapper.find('button'))).toMatchSnapshot()
  });

  it('removes the item from cart', async () => {
    let apolloClient
    const wrapper = mount (
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client
            return <RemoveFromCart id="abc123"/>
          }}
        </ApolloConsumer>
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    const { data: { me } } = await apolloClient.query({ query: CURRENT_USER_QUERY })
    expect(me.cart).toHaveLength(1)
    expect(me.cart[0].item.price).toBe(5000)
    // remove item from cart
    wrapper.find('button').simulate('click')
    await wait()
    // check if item is in the cart
    const { data: { me: me2 } } = await apolloClient.query({ query: CURRENT_USER_QUERY })
    expect(me2.cart).toHaveLength(0)
  })
});
