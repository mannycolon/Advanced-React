function Person(name, foods) {
  this.name = name;
  this.foods = foods;
}

Person.prototype.fetchFavFoods = function() {
  return new Promise((resolve, reject) => {
    // simulate an API
    setTimeout(() => resolve(this.foods), 2000);
  })
}

describe('Mocking learning', () => {
  it('mocks a reg function', () => {
    const fetchDogs = jest.fn()
    fetchDogs('snickers')
    expect(fetchDogs).toHaveBeenCalled()
    expect(fetchDogs).toHaveBeenCalledWith('snickers')
    fetchDogs('hugo')
    expect(fetchDogs).toHaveBeenCalledTimes(2)
  });

 it('can create a person', () => {
   const me = new Person('Manny', ['pizza', 'burgs'])
   expect(me.name).toBe('Manny')
  });

  it('can fetch foods', async () => {
   const me = new Person('Manny', ['pizza', 'burgs'])
   // mock the favFoods function
   me.fetchFavFoods = jest.fn().mockResolvedValue(['sushi', 'ramen'])
   const favFoods = await me.fetchFavFoods()
   expect(favFoods).toContain('sushi')
  });
});
