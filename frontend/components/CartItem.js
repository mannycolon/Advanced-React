import React from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components'
import formatMoney from '../lib/formatMoney'

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3 {
    margin: 0px;
  }
`

const CartItem = ({ cartItem: { item, quantity } }) => {
  return (
    <CartItemStyles>
      <img src={item.image} width="100" alt={item.title}/>
      <div className="cart-item-details">
        <h3>{item.title}</h3>
        <p>
          {formatMoney(item.price * quantity)}
          {' - '}
          <em>{quantity} &times; {formatMoney(item.price)} each</em>
        </p>
      </div>
    </CartItemStyles>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
}

export default CartItem;
