import React from "react";
import { useQuery } from '@apollo/react-hooks';
import { useEffect } from 'react'
import { QUERY_CATEGORIES } from "../../utils/queries";
// import global state
import { useDispatch, useSelector } from 'react-redux'
import { UPDATE_CATEGORIES, UPDATE_CURRENT_CATEGORY } from "../../utils/actions";
import { idbPromise } from '../../utils/helpers';


function CategoryMenu() {

  // when we use this component we call useStoreContext hook to get current state from global object, and use dispatch to update it
  const state = useSelector(state => state);
  const dispatch = useDispatch();

  // only need categories array out of our global state so destructure out of state 
  const { categories } = state

  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES)

  // when use query hook returns, the use effect hook notices that category data isn't undefined anymore and runs the dispatch function setting category data to the global state
  // use effect takes in a function to run a condition and the condition - in this case function runs immediately after load or when state changes, and passes in our function to update global state and runs dispatch when usequery
  useEffect(() => {
    // if categoryData exists or has changed from the response of useQuery, run dispatch()
    if (categoryData) {
      //execute our dispatch function with action object indicating the type of action and the data to set our state for categories
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories
      })
      // write category data to the categories object store in INdexedDB
      categoryData.categories.forEach(category => {
        idbPromise('categories', 'put', category)
      })
      //check if loading return exists and pull from indexedDB if not
    } else if (!loading) {
      idbPromise('categories', 'get').then(categories => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories: categories
        })
      })
    }
  }, [categoryData, loading, dispatch] )

  function handleClick(id) {
    dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id
    })
  }

  return (
    <div>
      <h2>Choose a Category:</h2>
      {categories.map(item => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryMenu;
