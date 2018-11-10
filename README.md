# node-deliveroo

An API for Deliveroo

## Usage

```javascript
const Deliveroo = require('node-deliveroo');
const deliveroo = new Deliveroo();
```

### Sign up

```javascript
deliveroo.signUp(login, password);
```

### Log in

```javascript
deliveroo.login(login, password);
```

### Update profile

```javascript
deliveroo.updateProfile(userId, {mobile = '', lastName, marketingPreferences = {}, firstName});
```

### Add a voucher to an account

```javascript
deliveroo.addVoucherToUser(userId, voucher);
```

### Get user order history

```javascript
deliveroo.getHistory(userId);
```

### Get order details

```javascript
deliveroo.getOrderDetails(orderId, userId);
```

### Get available restaurants

```javascript
deliveroo.getAvailableRestaurants(lat, lng);
```

### Get available categories

```javascript
deliveroo.getAvailableCategories(lat, lng);
```

### Get available restaurant in specific category

```javascript
deliveroo.getAvailableRestaurantsInCategory(lat, lng, categoryId);
```

### Get restaurant details

```javascript
deliveroo.getRestaurantDetails(restaurantId);
```

### Get list of saved addresses

```javascript
deliveroo.getSavedAddresses(userId);
```

### Add a new saved address

```javascript
deliveroo.addSavedAddress(userId, {name, phone, address, postCode, country, userConfirmedCoordinates =
false, lat, lng})
```

### Delete a saved address

```javascript
deliveroo.deleteSavedAddress(userId, savedAddressId);
```

### Get list of payment methods available

```javascript
deliveroo.getPaymentMethods(userId);
```

### Get Stripe tokens

```javascript
deliveroo.getStripeTokens();
```

### Add Stripe payment method to account

```javascript
delivero.addPaymentMethod(userId, tokenId);
```

### Delete a payment method

```javascript
deliveroo.deletePaymentMethod(userId, paymentMethodId);
```
