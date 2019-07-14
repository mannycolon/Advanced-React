import { shallow } from 'enzyme'
import ItemComponent from '../components/Item'
import toJSON from 'enzyme-to-json'

const fakeItem = {
  id: 'abc1234',
  title: 'A Cool Item',
  price: 4000,
  description: 'This Item is really cool!',
  image: 'gog.jpg',
  largeImage: 'largedog.jpg',
}

describe('<Item/>', () => {
  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>)
    expect(toJSON(wrapper)).toMatchSnapshot()
  });
  // it('Renders and displays properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem}/>)
  //   const img = wrapper.find('img')
  //   expect(img.props().src).toBe(fakeItem.image)
  //   expect(img.props().alt).toBe(fakeItem.title)
  // });

  // it('Renders out the buttons properly', () => {
  //   const wrapper = shallow(<ItemComponent item={fakeItem}/>)
  //   const buttonList = wrapper.find('.buttonList')
  //   expect(buttonList.children()).toHaveLength(3)
  //   expect(buttonList.find('Link')).toHaveLength(1)
  //   expect(buttonList.find('AddToCart').exists()).toBe(true)
  //   expect(buttonList.find('DeleteItem').exists()).toBe(true)
  // });
});
