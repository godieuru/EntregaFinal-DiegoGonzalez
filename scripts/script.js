var productscontainer = document.querySelector(".products");

async function loadproducts() {
  var response = await fetch("../data/products.json");
  var products = await response.json();
  displayproducts(products);
}
  
function displayproducts(products) {
  productscontainer.innerHTML = "";

  products.forEach(function (product) {
    var productelement = document.createElement("div");
    productelement.classList.add("product");
    productelement.id = product.id;

    productelement.innerHTML = `
            <div class="carousel">
                <div class="carouselimages">
                    ${product.images
                      .map(
                        (image) =>
                          `<img src="${image}" alt="${
                            product.title || product.name
                          }">`
                      )
                      .join("")}
                </div>
                <button class="prev">&#10094;</button>
                <button class="next">&#10095;</button>
            </div>
            <div class="productdetails">
                <h2 class="titleproduct">${product.title || product.name}</h2>
                <p>${product.description}</p>
                <p class="price">usd ${product.price.toFixed(2)}</p>
                <button class="addtocart" data-product="${
                  product.title || product.name
                }" data-price="${product.price}">
                    Add to cart
                </button>
            </div>
        `;

    productscontainer.appendChild(productelement);
  });

  initializecarousels();
  initializecart(products);
}

function initializecarousels() {
  var carousels = document.querySelectorAll(".carousel");

  carousels.forEach(function (carousel) {
    var images = carousel.querySelectorAll(".carouselimages img");
    var prev = carousel.querySelector(".prev");
    var next = carousel.querySelector(".next");
    var index = 0;
    var intervaltime = 3000;

    function updatecarousel() {
      images.forEach(function (img) {
        img.classList.remove("active");
      });

      images[index].classList.add("active");
    }

    prev.addEventListener("click", function () {
      index = index === 0 ? images.length - 1 : index - 1;
      updatecarousel();
    });

    next.addEventListener("click", function () {
      index = index === images.length - 1 ? 0 : index + 1;
      updatecarousel();
    });

    setInterval(function () {
      index = index === images.length - 1 ? 0 : index + 1;
      updatecarousel();
    }, intervaltime);

    updatecarousel();
  });
}

function initializecart(products) {
  var cart = loadcartfromlocalstorage();
  var cartitems = document.getElementById("cartitems");
  var carttotal = document.getElementById("carttotal");
  var togglecart = document.getElementById("cartbutton");
  var emptycartbutton = document.getElementById("emptycart");
  var checkoutbutton = document.getElementById("checkout");
  var paymentmodal = document.getElementById("payment");
  var closemodal = document.querySelector(".closemodal");
  var submitpaymentbutton = document.getElementById("submitpayment");
  var cancelpaymentbutton = document.getElementById("cancelpayment");
  var paymentinputs = document.querySelectorAll("#payment input");

  togglecart.addEventListener("click", function () {
    var cartcontent = document.getElementById("cartcontent");
    cartcontent.style.display =
      cartcontent.style.display === "none" || cartcontent.style.display === ""
        ? "block"
        : "none";
  });

  document.querySelectorAll(".addtocart").forEach(function (button) {
    button.addEventListener("click", function () {
      var product = button.getAttribute("data-product");
      var price = parseFloat(button.getAttribute("data-price"));

      if (cart[product]) {
        cart[product].quantity += 1;
        cart[product].total += price;
      } else {
        cart[product] = { price: price, quantity: 1, total: price };
      }

      updatecart();
      showalert("Product added to cart: " + product);
    });
  });

  function updatecart() {
    cartitems.innerHTML = "";
    var total = 0;

    for (var product in cart) {
      var item = cart[product];
      var li = document.createElement("li");
      li.innerHTML = `
                ${product}: $${item.price.toFixed(2)} x ${item.quantity}
                <button onclick="increasequantity('${product}')">+</button>
                <button onclick="decreasequantity('${product}')">-</button>
            `;
      cartitems.appendChild(li);
      total += item.total;
    }

    carttotal.textContent = total.toFixed(2);
    document.getElementById("cartcount").textContent = Object.keys(cart).reduce(
      function (sum, product) {
        return sum + cart[product].quantity;
      },
      0
    );

    savecarttolocalstorage();
  }

  function savecarttolocalstorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function loadcartfromlocalstorage() {
    var savedcart = localStorage.getItem("cart");
    return savedcart ? JSON.parse(savedcart) : {};
  }

  function showalert(message) {
    Swal.fire({
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    });
  }

  function clearpaymentinputs() {
    paymentinputs.forEach(function (input) {
      input.value = "";
    });
  }

  emptycartbutton.addEventListener("click", function () {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, please",
    }).then(function (result) {
      if (result.isConfirmed) {
        cart = {};
        updatecart();
        showalert("Cart emptied");
      }
    });
  });

  checkoutbutton.addEventListener("click", function () {
    if (Object.keys(cart).length === 0) {
      showalert("Your cart is empty!");
    } else {
      paymentmodal.style.display = "block";
    }
  });

  closemodal.addEventListener("click", function () {
    paymentmodal.style.display = "none";
    clearpaymentinputs();
  });

  cancelpaymentbutton.addEventListener("click", function () {
    paymentmodal.style.display = "none";
    clearpaymentinputs();
  });

  submitpaymentbutton.addEventListener("click", function (event) {
    event.preventDefault();
    Swal.fire({
      title: "Payment Successful",
      text: "Thank you for your purchase!",
      icon: "success",
      confirmButtonText: "OK",
    });
    paymentmodal.style.display = "none";
    cart = {};
    updatecart();
    clearpaymentinputs();
  });

  updatecart();
}

loadproducts();
