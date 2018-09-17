const axios = require('axios');
const faker = require('faker');

class Deliveroo {
  constructor() {
    this.request = axios.create({
      baseURL: 'https://deliveroo.co.uk/orderapp/v1'
    });
  }

  setAccessToken(userId, sessionToken) {
    this.request.defaults.headers.common['Authorization'] = '';
    delete this.request.defaults.headers.common['Authorization'];

    const accessToken = new Buffer(`${userId}:orderapp_ios,${sessionToken}`).toString('base64')
    this.request.defaults.headers.common[
      'Authorization'
    ] = `Basic ${accessToken}`;
  }

  async signUp(email, password) {
    try {
      let response = await this.request({
        method: 'POST',
        url: '/users',
        data: {
          password: password,
          country: "fr",
          last_name: faker.fake("{{name.lastName}}"),
          client_type: "orderapp_ios",
          email: email,
          marketing_preferences: {
            generic: false,
            profile_based: false
          },
          first_name: faker.fake("{{name.firstName}}")
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

  async login(email, password) {
    try {
      let response = await this.request({
        method: 'POST',
        url: '/login',
        auth: {
          username: email,
          password: password
        },
        data: {
          client_type: "orderapp_ios"
        },
        responseType: 'json'
      });
      this.setAccessToken(response.data.id, response.data.session_token);
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  async updateProfile(userId, {mobile = '', last_name, marketing_preferences = {}, first_name}) {
    try {
      let response = await this.request({
        method: 'PATCH',
        url: `/users/${userId}`,
        data: {
          mobile: mobile,
          last_name: last_name,
          marketing_preferences: marketing_preferences,
          first_name: first_name
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  async addVoucherToUser(userId, voucher) {
    try {
      let response = await this.request({
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

  async getHistory(userId) {
    try {
      let response = await this.request({
        method: 'GET',
        url: `/users/${userId}/orders`,
        data: {
          client_type: "orderapp_ios"
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  }

  async getOrderDetails(orderId, userId) {
    try {
      let response = await this.request({
        method: 'GET',
        url: `/users/${userId}/orders/${orderId}`,
        data: {
          client_type: "orderapp_ios"
        },
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.log('error');
    }
  }

  async getAvailableRestaurants(lat, lng) {
    try {
      let response = await this.request({
        method: 'GET',
        url: '/restaurants',
        params: {
          lat: lat,
          lng: lng
        },
        data: {
          client_type: "orderapp_ios"
        },
        responseType: 'json'
      });
      return response.data.restaurants;
    } catch (error) {
      console.log('error');
    }
  }

  async getAvailableCategories(lat, lng) {
    try {
      const restaurants = await this.getAvailableRestaurants(lat, lng);
      return [...restaurants
          .filter(restaurant => restaurant.menu.menu_tags.length > 0)
          .map(restaurant => restaurant.menu.menu_tags)
          .reduce((acc, arr) => [...acc, ...arr], [])
          .reduce((acc, elem) => acc.set(elem.id, elem), new Map())
          .values()
        ]
        .sort((a, b) => a.id - b.id);
    } catch (error) {
      console.log('error');
    }
  }

  async getAvailableRestaurantsInCategory(lat, lng, categoryId) {
    try {
      const restaurants = await this.getAvailableRestaurants(lat, lng);
      return restaurants.filter(restaurant =>
        restaurant.menu.menu_tags && restaurant.menu.menu_tags.find(category => category.id === parseInt(categoryId))
      )
    } catch (error) {
      console.log('error');
    }
  }
}

module.exports = Deliveroo;