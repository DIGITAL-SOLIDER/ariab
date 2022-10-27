var uidNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

    if (uidNumber === null) {
      this.askuidNumber();
    }

    var toys = await this.gettoys();

    this.el.addEventListener("markerFound", () => {
      if (uidNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askuidNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to toy!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your uid number",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      uidNumber = inputValue;
    });
  },

  handleMarkerFound: function (toys, markerId) {
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];


    var toy = toys.filter(toy => toy.id === markerId)[0];

    if (toy.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "This toy is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);
   
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${toy.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${toy.id}`);
      priceplane.setAttribute("visible", true)

      var ratingPlane = document.querySelector(`#rating-plane-${toy.id}`);
      ratingPlane.setAttribute("visible", true);

      var reviewPlane = document.querySelector(`#review-plane-${toy.id}`);
      reviewPlane.setAttribute("visible", true);

      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);

      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");

      var payement = document.getElementById("pay-button")

      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");
      var payement = document.getElementById("pay-button");

      ratingButton.addEventListener("click", () => this.handleRatings(toy));

      orderButtton.addEventListener("click", () => {
        var uid;
        uidNumber <= 9 ? (uid = `T0${uidNumber}`) : `T${uidNumber}`;
        this.handleOrder(uid, toy);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will never be recieved",
          timer: 2000,
          buttons: false
        });
      });

      orderSummaryButtton.addEventListener("click", () =>
        this.handleOrderSummary()
      );

      payement.addEventListener("click", ()=> this.handlePayment())
    }
  },

  handleOrder: function (uid, toy) {
    firebase
      .firestore()
      .collection("uids")
      .doc(uid)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][toy.id]) {
          details["current_orders"][toy.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][toy.id]["quantity"];

          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;

        firebase
          .firestore()
          .collection("uids")
          .doc(doc.id)
          .update(details);
      });
  },
  gettoys: async function () {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  getOrderSummary: async function (uid) {
    return await firebase
      .firestore()
      .collection("uids")
      .doc(uid)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {

    var uid;
    uidNumber <= 9 ? (uid = `T0${uidNumber}`) : `T${uidNumber}`;

    var orderSummary = await this.getOrderSummary(uid);

    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    var uidBodyTag = document.getElementById("bill-uid-body");

    uidBodyTag.innerHTML = "";

    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {

      var tr = document.createElement("tr");

      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;

      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      uidBodyTag.appendChild(tr);
    });

    var Ttr = document.createElement("tr")

    var td1 = document.createElement("td")
    td1.setAttribute("class","no-line")

    var td2 = document.createElement("td")
    td2.setAttribute("class","no-line")

    var td3 = document.createElement("td")
    td3.setAttribute("class","no-line text-center")
    var strongy = document.createElement("strong")
    strongy.innerHTML="TOTAL"
    td3.appendChild(strongy)

    var td4 = document.createElement("td")
    td4.setAttribute("class","no-line text-right")
    td4.innerHTML= "$" + orderSummary.total_bill

    Ttr.appendChild(td1)
    Ttr.appendChild(td2)
    Ttr.appendChild(td3)
    Ttr.appendChild(td4)
  },
  handlePayment: function () {
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "none";

    var uid;
    uidNumber <= 9 ? (uid = `T0${uidNumber}`) : `T${uidNumber}`

    firebase
      .firestore()
      .collection("uids")
      .doc(uid)
      .update({
        current_0rders:{},
        total_bill:0
      }).then(()=>{
        swal({
          icon: "Success",
          title: "THANK FOR GIVING US FREE MONEY !",
          text: "YOU HAVE BEEN SCAMMED HAHA",
          timer: 2500,
          buttons: false
        })
      })
  },
  handleRatings: async function (toy) {
    var uid;
    uidNumber <= 9 ? (uid = `T0${uidNumber}`) : `T${uidNumber}`;
    var os = await this.getOrderSummary(uid)
    var curento = Object.keys(os.current_orders)
    if(curento.length > 0 && toy.id==curento){
      document.getElementById('rating-modal-div').style.display="flex"
      document.getElementById('rating-input').value="0"
      document.getElementById('feedback-input').value=""

      var srb = document.getElementById("save-rating-button")
      srb.addEventListener("click",()=>{
        document.getElementById('rating-modal-div').style.display="none"
        var rating = document.getElementById('rating-input').value
        var feedscams = document.getElementById('feedback-input').value

      firebase
      .firestore()
      .collection("toys")
      .doc(uid)
      .update({
        feedme: feedscams,
        rate: rating
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks For getting SCAMMED !",
          text: "We Hope You Enjoyed Your SCAM !!",
          timer: 2500,
          buttons: false
        })
      })
    })

    }else{
      swal({
        icon: "warning",
        title: "IF CALL THE POLICE THEN WILL BE VERY ANGRY WITH YOURSELF",
        text: "YOU GET NO SCAM AS YOU HAVE NOT ORDERD",
        timer: 2500,
        buttons: false
      })
    }
    
  },
  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
