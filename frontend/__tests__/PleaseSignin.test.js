import { mount } from 'enzyme'
import wait from 'waait'
import PleaseSignin from '../components/PleaseSignin'
import { CURRENT_USER_QUERY } from '../components/User';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
]

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
]

describe('<PleaseSignin/>', () => {
  it('renders the sign in dialog', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignin/>
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.text()).toContain('Please Sign In before continuing')
    expect(wrapper.find('Signin').exists()).toBeTruthy()
  });

  it('renders the child component whent he user is signed in', async () => {
    const Hey = () => <p>Hey!</p>
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignin>
          <Hey/>
        </PleaseSignin>
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.find('Hey').exists()).toBeTruthy()
    expect(wrapper.contains(<Hey/>)).toBeTruthy()
  });
});
