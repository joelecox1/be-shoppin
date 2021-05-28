
import React, { useEffect } from "react";
import { useQuery } from '@apollo/react-hooks';

import ProductItem from "../ProductItem";
import { useDispatch, useSelector } from 'react-redux';
import { UPDATE_PRODUCTS } from "../../utils/actions";
import { QUERY_PRODUCTS } from "../../utils/queries";
import spinner from "../../assets/spinner.gif"
import { idbPromise } from "../../utils/helpers"

function ProductList() {
  // immediately execute useStoreContext to get current global state, and dispatch to update state
  const state = useSelector(state => state);
	const dispatch = useDispatch();
  // destructure current category out to state
  const { currentCategory } = state;

  const { loading, data } = useQuery(QUERY_PRODUCTS);
  
  // use effect to wait for useQuery response to come in & tell reducer to update products action and save array of product data to global store
  useEffect(() => {
    if (data) {
      dispatch({
          type: UPDATE_PRODUCTS,
          products: data.products
        });

      // take each product and save it to IndexedDB using helper
      data.products.forEach((product) => {
        idbPromise('products', 'put', product)
      })
      // check if loading is undefined in useQuery()
      // if useQuery isn't establishing a connection, use data stored in indexedDB instead
    } else if (!loading) {
      idbPromise('products', 'get').then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        })
      })
    }
    // when that's done useStoreContext executes again giving us the product data needed to display products to the page
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }

    return state.products.filter(product => product.category._id === currentCategory);
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {/* retrieve products from state object */}
      {state.products.length ? (
        <div className="flex-row">
            {filterProducts().map(product => (
                <ProductItem
                  key= {product._id}
                  _id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  quantity={product.quantity}
                />
            ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      { loading ? 
      <img src={spinner} alt="loading" />: null}
    </div>
  );
}

export default ProductList;

