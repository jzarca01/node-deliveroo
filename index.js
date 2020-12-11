const axios = require("axios");
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

class Deliveroo {
  constructor() {
    this.request = axios.create({
      baseURL: "https://api.fr.deliveroo.com/orderapp/v1",
      headers: {
        "X-Roo-Country": "fr",
        "Accept-Language": "fr-fr",
        "User-Agent": "Deliveroo-OrderApp/3.73.0",
        "Content-Type": "application/json",
      },
    });
    axiosCookieJarSupport(this.request);
    this.request.defaults.jar = new tough.CookieJar();
  }

  setAccessToken(userId, sessionToken) {
    this.request.defaults.headers.common["Authorization"] = "";
    delete this.request.defaults.headers.common["Authorization"];

    const accessToken = new Buffer(
      `${userId}:orderapp_ios,${sessionToken}`
    ).toString("base64");
    this.request.defaults.headers.common[
      "Authorization"
    ] = `Basic ${accessToken}`;
  }

  async login(email, password) {
    try {
      await this.request({
        method: "POST",
        url: "/check-email",
        data: {
          email_address: email,
        },
        responseType: "json",
      });
      const response = await this.request({
        method: "POST",
        url: "/login",
        auth: {
          username: email,
          password: password,
        },
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      this.setAccessToken(response.data.id, response.data.session_token);
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async updateProfile(
    userId,
    { mobile = "", lastName, marketingPreferences = {}, firstName }
  ) {
    try {
      const response = await this.request({
        method: "PATCH",
        url: `/users/${userId}`,
        data: {
          mobile: mobile,
          last_name: lastName,
          marketing_preferences: marketingPreferences,
          first_name: firstName,
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error");
    }
  }

  async addVoucherToUser(userId, voucher) {
    try {
      const response = await this.request({
        method: "POST",
        url: `/users/${userId}/vouchers`,
        data: {
          redemption_code: voucher,
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error");
    }
  }

  async getHistory(userId) {
    try {
      const response = await this.request({
        method: "GET",
        url: `/users/${userId}/orders`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getOrderDetails(orderId, userId) {
    try {
      const response = await this.request({
        method: "GET",
        url: `/users/${userId}/orders/${orderId}`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error");
    }
  }

  async getAvailableRestaurants(lat, lng) {
    try {
      const response = await this.request({
        method: "GET",
        url: "/restaurants",
        params: {
          lat: lat,
          lng: lng,
        },
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data.restaurants;
    } catch (error) {
      console.log("error");
    }
  }

  async getAvailableCategories(lat, lng) {
    try {
      const restaurants = await this.getAvailableRestaurants(lat, lng);
      return [
        ...restaurants
          .filter((restaurant) => restaurant.menu.menu_tags.length > 0)
          .map((restaurant) => restaurant.menu.menu_tags)
          .reduce((acc, arr) => [...acc, ...arr], [])
          .reduce((acc, elem) => acc.set(elem.id, elem), new Map())
          .values(),
      ].sort((a, b) => a.id - b.id);
    } catch (error) {
      console.log("error");
    }
  }

  async getAvailableRestaurantsInCategory(lat, lng, categoryId) {
    try {
      const restaurants = await this.getAvailableRestaurants(lat, lng);
      return restaurants.filter(
        (restaurant) =>
          restaurant.menu.menu_tags &&
          restaurant.menu.menu_tags.find(
            (category) => category.id === parseInt(categoryId)
          )
      );
    } catch (error) {
      console.log("error");
    }
  }

  async getRestaurantDetails(restaurantId) {
    try {
      const response = await this.request({
        method: "GET",
        url: `/restaurants/${restaurantId}`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data.restaurants;
    } catch (error) {
      console.log("error");
    }
  }

  async getSavedAddresses(userId) {
    try {
      const response = await this.request({
        method: "GET",
        url: `/users/${userId}/addresses`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async addSavedAddress(
    userId,
    {
      name,
      phone,
      address,
      postCode,
      country,
      userConfirmedCoordinates = false,
      lat,
      lng,
    }
  ) {
    try {
      const response = await this.request({
        method: "POST",
        url: `/users/${userId}/addresses`,
        data: {
          post_code: postCode,
          phone: phone,
          country: country,
          address1: address,
          user_confirmed_coordinates: userConfirmedCoordinates,
          label: name,
          coordinates: [lat, lng],
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error");
    }
  }

  async deleteSavedAddress(userId, savedAddressId) {
    try {
      const response = await this.request({
        method: "DELETE",
        url: `/users/${userId}/addresses/${savedAddressId}`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getPaymentMethods(userId) {
    try {
      const response = await this.request({
        method: "GET",
        url: `/users/${userId}/payment-tokens`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getStripeTokens() {
    try {
      const tokens = await this.request({
        method: "GET",
        url: `/payment-providers/stripe/uk/client-tokens`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return tokens.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async addPaymentMethod(userId, tokenId) {
    try {
      const payment = await this.request({
        method: "POST",
        url: `/users/${userId}/payment-tokens`,
        data: {
          nonce: tokenId,
          provider: "stripe",
        },
        responseType: "json",
      });
      return payment.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async deletePaymentMethod(userId, paymentMethodId) {
    try {
      const response = await this.request({
        method: "DELETE",
        url: `/users/${userId}/payment-tokens/${paymentMethodId}`,
        data: {
          client_type: "orderapp_ios",
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = Deliveroo;
