// 篩選產品列表清單(點選類別渲染相對應產品) OK
// 點選加入購物車 => 渲染我的購物車 OK
// 購物車刪除特定產品OK & 全部產品OK、計算購物車總金額OK
// 點選送出預訂資料 => 送出購買訂單api OK

// 代入自己的網址路徑
const api = 'https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer';
const apiPath = 'hsinhui';
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
    .get(`${api}/${apiPath}/products`)
    .then(function (response) {
      productList = response.data.products;
      renderProductList('全部'); //預設載入全部資料
    })
    .catch(function (err) {
      console.log(err);
      Swal.fire('目前網頁怪怪的，工程師全力修復中');
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
      <p class="normal-price">NT$${thousandsComma(item.origin_price)}</p>
      <p class="sale-price">NT$${thousandsComma(item.price)}</p>
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
    .post(`${api}/${apiPath}/carts`, {
      data: {
        productId: cartId,
        quantity: itemNum
      }
    })
    .then(function (response) {
      Swal.fire('加入購物車成功');
      getCartList();
    })
    .catch(function (err) {
      console.log(err);
      Swal.fire('庫存量不足，我們會盡快補貨><');
    });
}
// 取得購物車列表
function getCartList() {
  axios
    .get(`${api}/${apiPath}/carts`)
    .then(function (response) {
      cartItem = response.data.carts;
      totalPrice = response.data.finalTotal;
      renderCartList();
    })
    .catch(function (err) {
      console.log(err);
      Swal.fire('目前網頁怪怪的，工程師全力修復中');
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
    <td>NT$${thousandsComma(item.product.price)}</td>
    <td><a href="#"><i class="fas fa-minus js-reduce" data-reduce=${item.id},${item.quantity}></i></a>
     ${item.quantity} <a href="#"><i class="fas fa-plus js-increment" data-increment=${item.id},${
      item.quantity
    }></i></a> </td>
    <td>NT$${thousandsComma(item.product.price * item.quantity)}</td>
    <td>
      <a href="#" ><i class="fas fa-times js-delete" data-num=${item.id}></i></a>
    </td>
  </tr>`;
  });
  boughtItem.innerHTML = str;
  totalPriceEl.textContent = `NT$${thousandsComma(totalPrice)}`;
}
// 更改購物車內產品數量
boughtItem.addEventListener('click', boughtItemFunction);
function patchCartItem(cartId, num) {
  axios
    .patch(`${api}/${apiPath}/carts`, {
      data: {
        id: cartId,
        quantity: num
      }
    })
    .then(function () {
      getCartList();
    })
    .catch(function (err) {
      console.log(err);
    });
}
// 將購物車監聽都放在此函示
function boughtItemFunction(e) {
  e.preventDefault();
  let value = '';
  let target = e.target.getAttribute('class');
  //target若是null就給null，若有值(有class)，則用空白隔開兩個class並將最後一個class拔出來賦予在value上
  target === null ? null : (value = target.split(' ').pop());
  switch (value) {
    case 'js-increment':
      // 將data-increment裡的兩個值用逗號隔開回傳陣列
      let incrementData = e.target.dataset.increment.split(',');
      // 目前的產品數量 +1 => 想更改成的產品數量
      let incrementNum = Number(incrementData[1]) + 1;
      patchCartItem(incrementData[0], incrementNum);
      break;
    case 'js-reduce':
      let reduceData = e.target.dataset.reduce.split(',');
      let reduceNum = Number(reduceData[1]) - 1;
      if (reduceNum === 0) {
        alert('商品數量不能小於0');
        return;
      }
      patchCartItem(reduceData[0], reduceNum);
      break;
    case 'js-delete':
      let cartId = e.target.dataset.num;
      deleteCartItem(cartId);
    default:
      break;
  }
}

// 清除購物車內全部產品
deleteAllBtn.addEventListener('click', deleteAllCartList);
function deleteAllCartList() {
  if (cartItem.length === 0) {
    Swal.fire('購物車已經沒有東西了QQ');
    return;
  }
  Swal.fire({
    title: '確定要清空購物車嗎?',
    showCancelButton: true,
    cancelButtonText: `取消`,
    confirmButtonText: `確定`
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('成功清空購物車!', '', 'success');
      axios
        .delete(`${api}/${apiPath}/carts`)
        .then(function (response) {
          getCartList();
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  });
}
// 刪除購物車選擇產品
boughtItem.addEventListener('click', boughtItemFunction);
function deleteCartItem(cartId) {
  Swal.fire({
    title: '確定移除此產品?',
    showCancelButton: true,
    cancelButtonText: `取消`,
    confirmButtonText: `確定`
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('成功移除!', '', 'success');
      axios
        .delete(`${api}/${apiPath}/carts/${cartId}`)
        .then(function (response) {
          // console.log(response.data);
          getCartList();
        })
        .catch(function (err) {
          console.log(err);
          Swal.fire('產品刪除失敗!');
        });
    }
  });
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
        message: '必填!'
      },
      format: {
        pattern: /^[09]{2}\d{8}$/, //手機驗證表達式
        message: '請輸入正確格式'
      }
      // numericality: {
      //   onlyInteger: true,
      //   message: '請輸入正確格式'
      // }
    },
    email: {
      email: {
        message: '請輸入正確格式'
      },
      presence: {
        message: '必填!'
      }
    },
    寄送地址: {
      presence: {
        message: '必填!'
      }
    }
  };
  submitBtn.addEventListener('click', checkValidate);
  function checkValidate() {
    inputs.forEach((item) => {
      // 每次驗證前先清空提醒文字，這樣後來正確驗證後提醒文字才會不見
      item.nextElementSibling.textContent = '';
      errors = validate(form, constraints);
      if (errors) {
        //如果有錯誤訊息(有表單不符規定)
        Object.keys(errors).forEach(function (keys) {
          //選取相對應的input、select、textarea
          const keyName = document.querySelector(`input[name='${keys}']`);
          //所有選取元素的下一個同層輸入相對應的錯誤訊息
          keyName.nextElementSibling.textContent = errors[keys];
        });
      }
    });
    createOrder();
  }
}
// 送出購買訂單
function createOrder() {
  // 如購物車沒東西，或表單驗證有錯誤就不執行
  if (cartItem.length === 0 || errors) {
    Swal.fire('購物車可能沒東西或是資料填寫不完整');
    return;
  }
  axios
    .post(`${api}/${apiPath}/orders`, {
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
      Swal.fire('成功送出訂單!');
      form.reset();
      // 送出訂單會自動清空購物車，因此重新渲染購物車就OK
      getCartList();
    })
    .catch(function (err) {
      console.log(err);
    });
}

// utilities 工具類function 實務操作可能會單獨一隻檔案
function thousandsComma(num) {
  let parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
