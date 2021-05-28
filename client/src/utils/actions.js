// This file defines how our state will be maintained and updated

// update_products is used in the ProductList component
export const UPDATE_PRODUCTS = "UPDATE_PRODUCTS"
// works like update_products in that we want to take the list of categories retrieved from the server by Apollo and store it in this global state
export const UPDATE_CATEGORIES = "UPDATE_CATEGORIES"
// the connecting piece of data for the previous two actions
// we will be able to select a category from the stae from update_categories and display products for that list we create from update_products
export const UPDATE_CURRENT_CATEGORY = "UPDATE_CURRENT_CATEGORY"

export const ADD_TO_CART = 'ADD_TO_CART';
export const ADD_MULTIPLE_TO_CART = 'ADD_MULTIPLE_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const UPDATE_CART_QUANTITY = 'UPDATE_CART_QUANTITY';
export const CLEAR_CART = 'CLEAR_CART';
export const TOGGLE_CART = 'TOGGLE_CART';