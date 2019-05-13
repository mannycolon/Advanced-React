import React, { Component } from 'react';
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import Form from './styles/Form'
import ErrorMessage from './ErrorMessage'
import formatMoney from '../lib/formatMoney'

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`

class CreateItem extends Component {
  state = {
    title: 'shoe',
    description: 'nice shoe',
    image: 'dog.jpg',
    largeImage: 'large-dog.jpg',
    price: 0,
  }

  handleChange = (event) => {
    const { name, type, value } = event.target
    const val = type === 'number' ? parseFloat(value) : value
    this.setState({ [name]: val })
  }

  render() {
    const {
      title,
      price,
      description,
      image,
      largeImage,
    } = this.state
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={async e => {
            // stop the form from submitting
            e.preventDefault()
            // call the mutation
            const res = await createItem()
            // change them to the single item page
            Router.push({
              pathname: '/item',
              query: { id: res.data.createItem.id }
            })
            console.log(res)
          }}>
            <ErrorMessage error={error}/>
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={title}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={price}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION }