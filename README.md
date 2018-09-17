# node-deliveroo

An API for Deliveroo

## Usage

```javascript
const Deliveroo = require('node-deliveroo');
const deliveroo = new Deliveroo();
```

### Sign up

```javascript
deliveroo.signUp(login, password)
```

### Log in

```javascript
deliveroo.login(login, password);
```

### Update profile

```javascript
deliveroo.updateProfile(userId, {mobile = '', last_name, marketing_preferences = {}, first_name});
```

### Add a voucher to an account

```javascript
deliveroo.addVoucherToUser(userId, voucher);
```

### Get user order history

```javascript
deliveroo.getHistory(userId)
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
deliveroo.getAvailableRestaurantsInCategory(lat, lng, categoryId)
```