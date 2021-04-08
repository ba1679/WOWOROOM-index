// 篩選產品列表清單(點選類別渲染相對應產品) OK
// 點選加入購物車 => 渲染我的購物車 OK
// 購物車刪除特定產品OK & 全部產品OK、計算購物車總金額OK
// 點選送出預訂資料 => 送出購買訂單api OK

// 代入自己的網址路徑
const api_path = 'hsinhui';
const token = 'h3Vxb7Y0dZbtSXddEsCH5ZY3omb2';
// 取得網頁DOM
const productListEl = document.querySelector('.product-list');
const cartBtn = document.querySelector('.cart-btn');
const productOption = document.querySelector('.productOption');
const boughtItem = document.querySelector('.boughtItem');
const totalPriceEl = document.querySelector('.total-price');
const deleteAllBtn = document.querySelector('.deleteAllBtn');
const submitBtn = document.querySelector('.submitBtn');
const form = document.querySelector('.buyer-form');
const inputs = document.querySelectorAll('input[type=text],input[type=email],input[type=tel]');
const payment = document.querySelector("select[name='交易方式']");
// 定義產品列表變數
let productList = [];
// 定義用戶選擇後的篩選後陣列
let filterProduct = [];
// 購物車列表資料
let cartItem = [];
// 購物車總金額
let totalPrice;
// 網頁初始化: 渲染產品列表&購物車列表
function init() {
  getProductList();
  getCartList();
}
init();
// 取得產品列表
function getProductList() {
  axios
    .get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      productList = response.data.products;
      renderProductList('全部'); //預設載入全部資料
    })
    .catch(function (err) {
      console.log(err);
      alert('目前網頁怪怪的，工程師全力修復中');
    });
}

// 渲染產品列表
function renderProductList(category) {
  // 過濾回傳參數 = 資料類別的新陣列
  filterProduct = productList.filter((item) => {
    return category === item.category || category === '全部';
  });
  let str = '';
  filterProduct.forEach((item) => {
    str += `<li class="item">
    <div class="pic">
      <img src="${item.images}" alt="" />
    </div>
    <a href="#" data-id=${item.id} class="cart-btn">加入購物車</a>
    <div class="item-info">
      <p class="item-name">${item.title}</p>
      <p class="normal-price">NT$${item.origin_price}</p>
      <p class="sale-price">NT$${item.price}</p>
    </div>
    <div class="mark">新品</div>
  </li>`;
  });
  productListEl.innerHTML = str;
}
// 篩選產品列表
productOption.addEventListener('change', productFilter);
function productFilter(e) {
  let value = e.target.value;
  renderProductList(value);
}
// 加入購物車功能
productListEl.addEventListener('click', addCart);
function addCart(e) {
  e.preventDefault();
  // 因cart-btn資料回傳之前還沒出現，所以使用大範圍取值排除來做監聽事件
  if (e.target.nodeName !== 'A') {
    return;
  }
  let cartId = e.target.dataset.id;
  addCartItem(cartId);
}
function addCartItem(cartId) {
  // 加入購物車的數量
  let itemNum = 1;
  cartItem.forEach((item) => {
    // 若購物車資料內的產品id與點擊的產品id相同，購物車的數量要+1
    if (item.product.id === cartId) {
      itemNum = item.quantity += 1;
    }
  });
  axios
    .post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
      data: {
        productId: cartId,
        quantity: itemNum
      }
    })
    .then(function (response) {
      getCartList();
    })
    .catch(function (err) {
      console.log(err);
      alert('庫存量不足，我們會盡快補貨><');
    });
}
// 取得購物車列表
function getCartList() {
  axios
    .get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      cartItem = response.data.carts;
      totalPrice = response.data.finalTotal;
      renderCartList();
    })
    .catch(function (err) {
      console.log(err);
      alert('目前網頁怪怪的，工程師全力修復中');
    });
}

// 渲染購物車列表
function renderCartList() {
  let str = '';
  cartItem.forEach((item) => {
    str += `<tr>
    <td>
      <img src="${item.product.images}" alt="" />
      <p class="item-name">${item.product.title}</p>
    </td>
    <td>NT$${item.product.origin_price}</td>
    <td>${item.quantity}</td>
    <td>NT$${item.product.price}</td>
    <td>
      <a href="#"  ><i class="fas fa-times" data-num=${item.id}></i></a>
    </td>
  </tr>`;
  });
  boughtItem.innerHTML = str;
  totalPriceEl.textContent = `NT$${totalPrice}`;
}

// 清除購物車內全部產品
deleteAllBtn.addEventListener('click', deleteAllCartList);
function deleteAllCartList() {
  axios
    .delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      getCartList();
    })
    .catch(function (err) {
      console.log(err);
    });
}
// 刪除購物車選擇產品
boughtItem.addEventListener('click', deleteItem);
function deleteCartItem(cartId) {
  axios
    .delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      // console.log(response.data);
      getCartList();
    })
    .catch(function (err) {
      console.log(err);
      alert('購物車已經沒有東西了QQ');
    });
}
function deleteItem(e) {
  e.preventDefault();
  if (e.target.nodeName !== 'I') {
    return;
  }
  let cartId = e.target.dataset.num;
  deleteCartItem(cartId);
}
//表單驗證
let errors;
formValidate();
function formValidate() {
  const constraints = {
    姓名: {
      //對應的input給的name
      presence: {
        //套件變數(是否必填)
        message: '必填!' //若沒有填入會出現的訊息
      }
    },
    電話: {
      presence: {
        message: '必填'
      },
      type: {
        type: 'number',
        message: '請輸入正確格式'
      }
    },
    email: {
      email: {
        message: '請輸入正確格式'
      },
      presence: {
        message: '必填'
      }
    },
    寄送地址: {
      presence: {
        message: '必填'
      }
    }
  };

  submitBtn.addEventListener('click', checkValidate);
  function checkValidate() {
    inputs.forEach((item) => {
      item.nextElementSibling.textContent = '';
      if (item.value == '') {
        errors = validate(form, constraints);
        // console.log(errors);
        if (errors) {
          //如果有錯誤訊息(有表單不符規定)
          Object.keys(errors).forEach(function (keys) {
            //選取相對應的input、select、textarea
            const keyName = document.querySelector(`input[name='${keys}']`);
            //所有選取元素的下一個同層輸入相對應的錯誤訊息
            keyName.nextElementSibling.textContent = errors[keys];
          });
        }
      }
    });
  }
}
// 送出購買訂單
submitBtn.addEventListener('click', createOrder);
function createOrderCheck() {
  if (errors || cartItem == []) {
    return;
  }
  createOrder();
}
function createOrder() {
  if (errors || cartItem == []) {
    return;
  }
  axios
    .post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`, {
      data: {
        user: {
          name: inputs[0].value,
          tel: inputs[1].value,
          email: inputs[2].value,
          address: inputs[3].value,
          payment: payment.value
        }
      }
    })
    .then(function (response) {
      alert('已成功送出訂單!');
    })
    .catch(function (err) {
      console.log(err);
    });
  form.reset();
  deleteAllCartList();
}
