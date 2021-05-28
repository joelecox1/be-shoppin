import React, { useEffect } from 'react';
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import './style.css';
import { useDispatch, useSelector } from 'react-redux'
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";
import { QUERY_CHECKOUT } from '../../utils/queries';
import { loadStripe } from '@stripe/stripe-js';
//another hook like useQuery that won't execute until you tell it to
import { useLazyQuery } from '@apollo/react-hooks'
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Cart = () => {

    // custom useStoreContext from global state hook to establish state variable and dispatch function to update it
    const state = useSelector(state => state)
    const dispatch = useDispatch()

    // data contains the checkout session, but only runs after query is called with getCheckout function
    const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT)

    useEffect(() => {
      async function getCart() {
        const cart = await idbPromise('cart', 'get')
        // use add multiple because idb returns an array even if it's just one item
        dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] })
      }

      //check if state.cart.length is 0, then execute get cart to get cart object store and save in global state object
      if (!state.cart.length) {
        getCart()
      }
      // pass state.cart.length in as a dependency - we list all the data here that useEffect is dependent on to run, and it won't run twice if the value of state.cart.length hasn't changed
    }, [state.cart.length, dispatch] )

    function toggleCart() {
        // dispatch calls toggle cart action
        dispatch({ type: TOGGLE_CART });
    }

    // add up prices of everything saved in state.cart
    function calculateTotal() {
      let sum = 0;
      state.cart.forEach(item => {
        sum += item.price * item.purchaseQuantity;
      });
      return sum.toFixed(2);
    }

    // collect ID's for items being purchased when user hits checkout button
    // this function loops over items saved in state.cart and add their IDs to a new productIds arrya
    // the productIds array is what the QUERY_CHECKOUT query would need to generate the Stripe session
    function submitCheckout() {

      const productIds = [];

      state.cart.forEach((item) => {
        for (let i = 0; i < item.purchaseQuantity; i++) {
          productIds.push(item._id)
        }
      })
      // call useLazyQuery hook
      getCheckout({ variables: { products: productIds }})
    }

    useEffect(() => {
      if (data) {
        stripePromise.then((res) => {
          res.redirectToCheckout({ sessionId: data.checkout.session });
        });
      }
    }, [data]);

    // if cartOpen is false, component returns a smaller div - clicking this div will set cart open to true and toggleCart
    if (!state.cartOpen) {
        return (
          <div className="cart-closed" onClick={toggleCart}>
            <span
              role="img"
              aria-label="trash">🛒</span>
          </div>
        );
    }

  return (
    <div className="cart">
      <div className="close" onClick={toggleCart}>[close]</div>
      <h2>Shopping Cart</h2>
      {state.cart.length ? (
        <div>
          {state.cart.map(item => (
            <CartItem key={item._id} item={item} />
          ))}
          <div className="flex-row space-between">
            <strong>Total: ${calculateTotal()}</strong>
            {
              Auth.loggedIn() ?
                <button onClick={submitCheckout}>
                  Checkout
                </button>
                :
                <span>(log in to check out)</span>
            }
          </div>
        </div>
      ) : (
        <h3>
          <span role="img" aria-label="shocked">
            😱
          </span>
          You haven't added anything to your cart yet!
        </h3>
      )}
    </div>
  );
};

export default Cart;