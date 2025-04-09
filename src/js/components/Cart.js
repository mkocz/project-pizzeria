import { classNames, select, templates, settings } from "../settings.js";
import utils from "../utils.js"
import CartProduct from "./CartProduct.js";

class Cart {
    constructor(element) {
        const thisCart = this;

        thisCart.products = [];
        thisCart.getElements(element);
        thisCart.initActions();
    }

    getElements(element) {
        const thisCart = this;

        thisCart.dom = {};
        thisCart.dom.wrapper = element;
        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
        thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
        thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
        thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
        thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
        thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
        thisCart.dom.successMessage = thisCart.dom.wrapper.querySelector(select.cart.successMessage);
    }

    initActions() {
        const thisCart = this;
        thisCart.dom.toggleTrigger.addEventListener('click', function () {
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
            thisCart.dom.successMessage.classList.remove(classNames.cart.messageVisible);
        })
        thisCart.dom.productList.addEventListener('updated', function () {
            thisCart.update();
            thisCart.dom.successMessage.classList.remove(classNames.cart.messageVisible);
        })
        thisCart.dom.productList.addEventListener('remove', function (event) {
            thisCart.remove(event.detail.cartProduct);
        })
        thisCart.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisCart.sendOrder();
        })
    }

    add(menuProduct) {
        const thisCart = this;

        if (thisCart.products.length > 0) {
            for (let product of thisCart.products) {
                if ((menuProduct.id === product.id) && (JSON.stringify(menuProduct.params) === JSON.stringify(product.params))) {
                    product.amount += menuProduct.amount;
                    product.amountWidget.setValue(product.amount);
                    thisCart.update();
                    return
                }
            }
        }

        const generatedHTML = templates.cartProduct(menuProduct);
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        thisCart.dom.productList.appendChild(generatedDOM);
        thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
        thisCart.update();
    }

    remove(menuProduct) {
        const thisCart = this;

        const indexOfProduct = thisCart.products.indexOf(menuProduct);
        thisCart.products.splice(indexOfProduct, 1)
        menuProduct.dom.wrapper.remove();
        thisCart.update();
    }

    update() {
        const thisCart = this;

        const deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.totalNumber = 0;
        thisCart.subtotalPrice = 0;
        thisCart.totalPrice = 0;
        thisCart.deliveryFee = 0;

        for (let product of thisCart.products) {
            thisCart.totalNumber += product.amount;
            thisCart.subtotalPrice += product.price;
        }
        if (thisCart.products.length > 0) {
            thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
            thisCart.deliveryFee = deliveryFee;
        }

        for (let el of thisCart.dom.totalPrice) {
            el.innerHTML = thisCart.totalPrice;
        }

        thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
        thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    }

    sendOrder() {
        const thisCart = this;

        const url = settings.db.url + '/' + settings.db.orders;
        const payload = {
            address: thisCart.dom.address.value,
            phone: thisCart.dom.phone.value,
            totalPrice: thisCart.totalPrice,
            subtotalPrice: thisCart.subtotalPrice,
            totalNumber: thisCart.totalNumber,
            deliveryFee: thisCart.deliveryFee,
            products: []
        }

        for (let prod of thisCart.products) {
            payload.products.push(prod.getData());
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function () {
                thisCart.clear();
                thisCart.dom.successMessage.classList.add(classNames.cart.messageVisible)
            });
    }

    clear() {
        const thisCart = this;

        thisCart.products = [];
        thisCart.dom.productList.innerHTML = '';
        thisCart.update();
    }
}

export default Cart