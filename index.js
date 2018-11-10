const axios = require('axios');
const faker = require('faker');

/**
 * @class Deliveroo
 */
class Deliveroo {
  /**
   * Creates an instance of Deliveroo class.
   * @memberof Deliveroo
   */
  constructor() {
    this.request = axios.create({
      baseURL: 'https://deliveroo.co.uk/orderapp/v1'
    });
  }

  /**
   * Set the authorisation header for Deliveroo api requests
   *
   * @param {*} userId Deliveroo user identifer
   * @param {*} sessionToken Deliveroo user session token
   * @memberof Deliveroo
   */
  setAccessToken(userId, sessionToken) {
    this.request.defaults.headers.common['Authorization'] = '';
    delete this.request.defaults.headers.common['Authorization'];

    const accessToken = new Buffer(`${userId}:orderapp_ios,${sessionToken}`).toString('base64');
    this.request.defaults.headers.common['Authorization'] = `Basic ${accessToken}`;
  }

  /**
   * Register a new account on Deliveroo
   *
   * @param {string} email The email associated with the new account
   * @param {string} password The password associated with the new account
   * @return {DeliverooUser} A Deliveroo user object if everything ok
   * @memberof Deliveroo
   */
  async signUp(email, password) {
    try {
      const response = await this.request({
        method: 'POST',
        url: '/users',
        data: {
          password: password,
          country: 'fr',
          last_name: faker.fake('{{name.lastName}}'),
          client_type: 'orderapp_ios',
          email: email,
          marketing_preferences: {
            generic: false,
            profile_based: false
          },
          first_name: faker.fake('{{name.firstName}}')
        },
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'json'
      });
      this.setAccessToken(response.data.id, response.data.session_token);
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Login to Deliveroo with account
   *
   * @param {string} email Your account login
   * @param {string} password Your account password
   * @return {DeliverooUser} A Deliveroo user object if login succeded
   * @memberof Deliveroo
   */
  async login(email, password) {
    try {
      const response = await this.request({
        method: 'POST',
        url: '/login',
        auth: {
          username: email,
          password: password
        },
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      this.setAccessToken(response.data.id, response.data.session_token);
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Update Deliveroo profile informations
   *
   * @param {number} userId The Deliveroo user identifier
   * @param {DeliverooUserInfo} infos Informations to update
   * @return {DeliverooUser} Updated user if update successful
   * @memberof Deliveroo
   */
  async updateProfile(userId, {
    mobile = '',
    lastName,
    marketingPreferences = {},
    firstName
  }) {
    try {
      const response = await this.request({
        method: 'PATCH',
        url: `/users/${userId}`,
        data: {
          mobile: mobile,
          last_name: lastName,
          marketing_preferences: marketingPreferences,
          first_name: firstName
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Add voucher to Deliveroo Account
   *
   * @param {number} userId The Deliveroo user identifier
   * @param {string} voucher The voucher code
   * @return {[Vouchers]} An array of vouchers available
   * @memberof Deliveroo
   */
  async addVoucherToUser(userId, voucher) {
    try {
      const response = await this.request({
        method: 'POST',
        url: `/users/${userId}/vouchers`,
        data: {
          redemption_code: voucher
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Get Deliveroo orders history
   *
   * @param {number} userId The Deliveroo user identifier
   * @return {[Order]} An array of order
   * @memberof Deliveroo
   */
  async getHistory(userId) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `/users/${userId}/orders`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Get Deliveroo Order Informations
   *
   * @param {number} orderId The Deliveroo order identifier
   * @param {number} userId The Deliveroo user identifier
   * @return {Order} An order
   * @memberof Deliveroo
   */
  async getOrderDetails(orderId, userId) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `/users/${userId}/orders/${orderId}`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Get a list of available restaurant
   * delivering the location specified
   *
   * @param {number} lat Latitude
   * @param {number} lng Longitude
   * @return {[Restaurant]} An array of restaurant
   * @memberof Deliveroo
   */
  async getAvailableRestaurants(lat, lng) {
    try {
      const response = await this.request({
        method: 'GET',
        url: '/restaurants',
        params: {
          lat: lat,
          lng: lng
        },
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data.restaurants;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Get a list of food categories available
   * to deliver from restaurants
   *
   * @param {number} lat Latitude of location
   * @param {number} lng Longitude of location
   * @return {[FoodCategory]} An array of food categories
   * @memberof Deliveroo
   */
  async getAvailableCategories(lat, lng) {
    try {
      const restaurants = await this.getAvailableRestaurants(lat, lng);
      return [...restaurants
        .filter((restaurant) => restaurant.menu.menu_tags.length > 0)
        .map((restaurant) => restaurant.menu.menu_tags)
        .reduce((acc, arr) => [...acc, ...arr], [])
        .reduce((acc, elem) => acc.set(elem.id, elem), new Map())
        .values()
      ].sort((a, b) => a.id - b.id);
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Get a list of restaurant matching
   * the category specified
   *
   * @param {number} lat Latitude of location
   * @param {number} lng Longitude of location
   * @param {number} categoryId The Deliveroo food category identifier
   * @return {[Restaurant]} An array of restaurant
   * @memberof Deliveroo
   */
  async getAvailableRestaurantsInCategory(lat, lng, categoryId) {
    try {
      const restaurants = await this.getAvailableRestaurants(lat, lng);
      return restaurants.filter((restaurant) =>
        restaurant.menu.menu_tags && restaurant.menu.menu_tags.find((category) => category.id === parseInt(categoryId))
      );
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Get restaurant details
   *
   * @param {number} restaurantId The Deliveroo restaurant identifier
   * @return {Restaurant} A detailed restaurant object
   * @memberof Deliveroo
   */
  async getRestaurantDetails(restaurantId) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `/restaurants/${restaurantId}`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data.restaurants;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Get the current delivery addresses
   * saved in the Deliveroo account
   *
   * @param {number} userId The Deliveroo user identifier
   * @return {[Address]} An array of addresses
   * @memberof Deliveroo
   */
  async getSavedAddresses(userId) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `/users/${userId}/addresses`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Add a delivery addresses to
   * save in the Deliveroo account
   *
   * @param {number} userId The Deliveroo user identifier
   * @param {Address} address The address to save
   * @return {Address} the savec addresse
   * @memberof Deliveroo
   */
  async addSavedAddress(userId, {
    name,
    phone,
    address,
    postCode,
    country,
    userConfirmedCoordinates = false,
    lat,
    lng
  }) {
    try {
      const response = await this.request({
        method: 'POST',
        url: `/users/${userId}/addresses`,
        data: {
          post_code: postCode,
          phone: phone,
          country: country,
          address1: address,
          user_confirmed_coordinates: userConfirmedCoordinates,
          label: name,
          coordinates: [
            lat,
            lng
          ]
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  /**
   * Delete a delivery address saved
   * in the Deliveroo account
   *
   * @param {number} userId The Deliveroo user identifier
   * @param {number} savedAddressId The account saved address identifier
   * @memberof Deliveroo
   */
  async deleteSavedAddress(userId, savedAddressId) {
    try {
      const response = await this.request({
        method: 'DELETE',
        url: `/users/${userId}/addresses/${savedAddressId}`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Get the current payment methods
   * saved in the Deliveroo account
   *
   * @param {number} userId The Deliveroo user identifier
   * @return {[PaymentMethod]} An array of payment methods
   * @memberof Deliveroo
   */
  async getPaymentMethods(userId) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `/users/${userId}/payment-tokens`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Get Stripe tokens
   *
   * @return {Object}
   * @memberof Deliveroo
   */
  async getStripeTokens() {
    try {
      const tokens = await this.request({
        method: 'GET',
        url: `/payment-providers/stripe/uk/client-tokens`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return tokens.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Add Stripe payment method to account
   *
   * @param {string} userId id of user
   * @param {string} tokenId token id returned by Stripe
   * @return {Object}
   * @memberof Deliveroo
   */
  async addPaymentMethod(userId, tokenId) {
    try {
      const payment = await this.request({
        method: 'POST',
        url: `/users/${userId}/payment-tokens`,
        data: {
          nonce: tokenId,
          provider: 'stripe'
        },
        responseType: 'json'
      });
      return payment.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * Delete a payment method saved
   * in the Deliveroo account
   *
   * @param {number} userId The Deliveroo user identifier
   * @param {number} paymentMethodId The account payment method identifier
   * @memberof Deliveroo
   */
  async deletePaymentMethod(userId, paymentMethodId) {
    try {
      const response = await this.request({
        method: 'DELETE',
        url: `/users/${userId}/payment-tokens/${paymentMethodId}`,
        data: {
          client_type: 'orderapp_ios'
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }
}

module.exports = Deliveroo;